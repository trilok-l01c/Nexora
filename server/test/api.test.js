import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { env } from "../config/env.js";
import {
    allowedTransitions,
    statusLabels,
    validStatuses,
} from "../middleware/validateLeadStatus.js";

let server;
let baseUrl;

before(async () => {
    // Express 5 passes bind errors to the listen callback. Handling that
    // callback directly avoids both the old missed-event race and a pending
    // setup promise when a port cannot be opened.
    await new Promise((resolve, reject) => {
        server = app.listen(0, "127.0.0.1", (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (!server?.listening) return;
    await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
    );
});

async function request(path, options) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { response, body };
}

test("health endpoint responds", async () => {
    const { response, body } = await request("/api/health");
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(
        body.status === "ok" || body.status === "degraded",
        `expected status "ok" or "degraded", got "${body.status}"`,
    );
    assert.ok(
        body.database === "connected" || body.database === "disconnected",
        `expected database "connected" or "disconnected", got "${body.database}"`,
    );
});

test("contact validation rejects missing required fields", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "client@example.com" }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Name is required.");
});

test("contact validation rejects invalid email", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client",
            email: "not-an-email",
            service: "Software development",
            message: "Project details",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please enter a valid email address.");
});

test("valid contact waits for the database instead of leaking an error", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client",
            email: "client@example.com",
            service: "Software development",
            message: "Project details",
        }),
    });
    assert.equal(response.status, 503);
    assert.equal(body.message, "Contact requests are temporarily unavailable.");
});

test("admin routes require authentication", async () => {
    const { response, body } = await request("/api/admin/projects");
    assert.equal(response.status, 401);
    assert.equal(body.message, "Authentication required.");
});

test("client project routes reject unauthenticated requests", async () => {
    const { response, body } = await request("/api/projects");
    assert.equal(response.status, 401);
    assert.equal(body.message, "Authentication required.");
});

test("admin logout clears the cookie", async () => {
    const { response, body } = await request("/api/admin/logout", {
        method: "POST",
    });
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
});

test("client signup validates required account fields", async () => {
    const { response, body } = await request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "client@example.com",
            password: "password123",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please enter your full name.");
});

test("client signup rejects mismatched passwords", async () => {
    const { response, body } = await request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client User",
            email: "client@example.com",
            company: "Acme Technologies",
            password: "password123",
            confirmPassword: "different123",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Passwords do not match.");
});

test("valid client signup waits for the database", async () => {
    const { response, body } = await request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client User",
            email: "client@example.com",
            company: "Acme Technologies",
            password: "password123",
            confirmPassword: "password123",
        }),
    });
    assert.equal(response.status, 503);
    assert.equal(body.message, "Account creation is temporarily unavailable.");
});

test("malformed JSON returns a safe client error", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{broken",
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Malformed JSON request body.");
});

test("public portfolio list waits for the database instead of leaking an error", async () => {
    const { response, body } = await request("/api/portfolio");
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.message, "The portfolio is temporarily unavailable.");
});

test("portfolio detail rejects malformed project ids", async () => {
    const { response, body } = await request("/api/portfolio/not-an-id");
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.message, "Portfolio project not found.");
});

test("admin portfolio routes require authentication", async () => {
    const jsonHeaders = { "Content-Type": "application/json" };
    const attempts = await Promise.all([
        request("/api/admin/portfolio", {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({ title: "Sneaky project" }),
        }),
        request("/api/admin/portfolio/665f0c0e1d4b3a2b8c9d0e11", {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify({ title: "Changed" }),
        }),
        request("/api/admin/portfolio/665f0c0e1d4b3a2b8c9d0e11", {
            method: "DELETE",
        }),
        request("/api/admin/portfolio/665f0c0e1d4b3a2b8c9d0e11/updates", {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({ title: "Sneaky update" }),
        }),
        request(
            "/api/admin/portfolio/665f0c0e1d4b3a2b8c9d0e11/updates/665f0c0e1d4b3a2b8c9d0e22",
            { method: "DELETE" },
        ),
    ]);
    for (const { response, body } of attempts) {
        assert.equal(response.status, 401);
        assert.equal(body.message, "Authentication required.");
    }
});

test("client accounts cannot manage portfolio projects", async () => {
    const clientToken = jwt.sign(
        { sub: "client-user-id", role: "client" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/portfolio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({ title: "Sneaky project" }),
    });
    assert.equal(response.status, 403);
    assert.equal(body.success, false);
    assert.equal(body.message, "Admin access required.");
});

test("admin portfolio creation accepts admin tokens and waits for the database", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/portfolio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            title: "AI Content Optimizer",
            shortDescription: "Internal demo project.",
            category: "AI & Automation",
            status: "Published",
        }),
    });
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(
        body.message,
        "Portfolio management is temporarily unavailable.",
    );
});

test("portfolio update creation rejects malformed project ids for admins", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/portfolio/not-an-id/updates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title: "Launch" }),
    });
    assert.equal(response.status, 404);
    assert.equal(body.message, "Portfolio project not found.");
});

test("portfolio image upload requires authentication", async () => {
    const { response, body } = await request("/api/admin/portfolio/upload", {
        method: "POST",
    });
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
});

test("portfolio image upload rejects non-admin users", async () => {
    const clientToken = jwt.sign(
        { sub: "client-user-id", role: "client" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/portfolio/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${clientToken}`,
        },
    });
    assert.equal(response.status, 403);
    assert.equal(body.success, false);
});

test("portfolio image upload rejects requests without a file", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/portfolio/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${adminToken}`,
        },
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.match(body.message, /no image file/i);
});

test("admin lead list requires authentication", async () => {
    const { response, body } = await request("/api/admin/leads");
    assert.equal(response.status, 401);
    assert.equal(body.message, "Authentication required.");
});

test("client sessions cannot access admin lead endpoints", async () => {
    const clientToken = jwt.sign(
        { sub: "client-user-id", role: "client", companyId: "company-id" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/leads", {
        headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.equal(response.status, 403);
    assert.equal(body.message, "Admin access required.");
});

test("lead status endpoint rejects unknown statuses", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/status",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ status: "qualified" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Invalid lead status.");
});

test("lead contact update rejects invalid emails", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ email: "not-an-email" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please enter a valid email address.");
});

test("lead contact update rejects empty change sets", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({}),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "No lead changes were provided.");
});

test("lead note endpoint rejects empty notes", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/notes",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ text: "   " }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Note text is required.");
});

test("lead conversion rejects short passwords", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/convert",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                companyName: "Example Ltd",
                clientName: "Test Client",
                email: "client@example.com",
                password: "short",
            }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Password must be at least 8 characters.");
});

test("lead conversion requires a company name", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/convert",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                clientName: "Test Client",
                email: "client@example.com",
                password: "password123",
            }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Company name is required.");
});

test("lead list waits for the database instead of leaking an error", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/leads", {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(response.status, 503);
    assert.equal(body.message, "Lead records are temporarily unavailable.");
});

test("contact validation requires a service", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client",
            email: "client@example.com",
            message: "Project details",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please select a service.");
});

test("lead contact update rejects invalid phone numbers", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ phone: "call-me-maybe" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please enter a valid phone number.");
});

test("lead contact update rejects unknown sources", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ source: "cold-call" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Invalid lead source.");
});

test("lead note endpoint rejects oversized notes", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/notes",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ text: "x".repeat(2001) }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Note is too long.");
});

test("lead conversion rejects invalid client names", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/leads/000000000000000000000000/convert",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                companyName: "Acme",
                clientName: "A",
                email: "client@example.com",
                password: "password123",
            }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Please enter the client's full name.");
});

test("contact rejects an oversized name instead of failing as a server error", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "A".repeat(150),
            email: "client@example.com",
            service: "Software development",
            message: "Project details",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Name is too long.");
});

test("contact rejects an oversized email instead of failing as a server error", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Client",
            email: `${"b".repeat(250)}@example.com`,
            service: "Software development",
            message: "Project details",
        }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Email address is too long.");
});

test("admin project routes report an unavailable database instead of hanging", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    // These handlers used to query without a connection guard, so Mongoose
    // buffered for 10s and then failed with a 500.
    for (const path of ["/api/admin/projects", "/api/home"]) {
        const { response } = await request(path, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert.equal(response.status, 503, `${path} should answer 503`);
    }
});

test("portfolio upload is charged a single rate-limit request", async () => {
    const adminToken = jwt.sign(
        { sub: "admin-user-id", role: "admin" },
        env.jwtSecret,
    );
    const send = () =>
        request("/api/admin/portfolio/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${adminToken}` },
        });
    const first = await send();
    const second = await send();
    assert.equal(first.response.status, 400);
    assert.equal(second.response.status, 400);
    // Mounted after `/api/admin`, the upload path fell through that router too,
    // so both limiters charged it and the remaining budget dropped by 4 over
    // two requests. Exactly 2 must be consumed.
    const remaining = (res) => Number(res.headers.get("ratelimit").match(/r=(\d+)/)[1]);
    // Mounted after `/api/admin`, the upload path fell through that router too,
    // so both limiters charged it and one request cost two units of budget.
    const before = remaining(first.response);
    const after = remaining(second.response);
    assert.equal(before - after, 1, `expected 1 charge, got ${before - after}`);
});

test("session and logout are never charged against the login budget", async () => {
    // These answer 503 while the database is down, and a 503 counts as a
    // failure. Without an explicit exemption the per-page-load session check
    // drained the whole budget and visitors saw "Too many login attempts".
    for (let i = 0; i < 8; i += 1) {
        const { response } = await request("/api/auth/session");
        assert.notEqual(response.status, 429, "session must not be rate limited");
        await request("/api/auth/logout", { method: "POST" });
    }
});

test("the session endpoint fails fast when the database is unavailable", async () => {
    const orphanToken = jwt.sign(
        {
            sub: "000000000000000000000009",
            role: "client",
            email: "deleted@example.com",
            companyId: "000000000000000000000008",
        },
        env.jwtSecret,
    );
    // Verifying the account behind the token means a database read, so this
    // endpoint now guards on the connection. Without the guard it buffered for
    // 10 seconds; the assertion also fails the test if that regresses.
    const startedAt = Date.now();
    const { response } = await request("/api/auth/session", {
        headers: { Cookie: `nexora_client_token=${encodeURIComponent(orphanToken)}` },
    });
    assert.equal(response.status, 503);
    assert.ok(
        Date.now() - startedAt < 1000,
        "the session check must not block on the database",
    );
});

test("lead lifecycle keeps the converted state out of manual transitions", () => {
    // `completed` means a client account exists, so it must only ever be set by
    // the conversion workflow — never by a status change, which would mark a
    // lead as converted without provisioning any account.
    for (const [from, targets] of Object.entries(allowedTransitions)) {
        if (from === "completed") continue;
        assert.equal(
            targets.has("completed"),
            false,
            `${from} must not transition to completed`,
        );
    }
    assert.deepEqual([...allowedTransitions.completed], ["completed"]);
    assert.deepEqual([...allowedTransitions.rejected], ["rejected"]);
    assert.deepEqual([...allowedTransitions.new], [
        "new",
        "contacted",
        "rejected",
    ]);
    assert.deepEqual([...allowedTransitions.contacted], [
        "contacted",
        "in_progress",
        "rejected",
    ]);
    assert.deepEqual([...allowedTransitions.in_progress], [
        "in_progress",
        "rejected",
    ]);
});

test("every lead status has a lifecycle rule and a timeline label", () => {
    for (const status of validStatuses) {
        assert.ok(
            allowedTransitions[status] instanceof Set,
            `missing lifecycle rule for ${status}`,
        );
        assert.equal(
            typeof statusLabels[status],
            "string",
            `missing status label for ${status}`,
        );
    }
    assert.equal(statusLabels.completed, "Converted to client");
});

// ---------------------------------------------------------------------------
// Admin workspace views: support queries, company roster, and team list.
// These endpoints were added for the tabbed admin workspace; they are guarded
// by the same `authenticateAdmin` middleware as every other admin route.
// ---------------------------------------------------------------------------

test("support query routes require authentication", async () => {
    const { response, body } = await request("/api/admin/tickets");
    assert.equal(response.status, 401);
    assert.equal(body.message, "Authentication required.");
});

test("company and team routes require authentication", async () => {
    for (const path of ["/api/admin/companies", "/api/admin/team"]) {
        const { response, body } = await request(path);
        assert.equal(response.status, 401);
        assert.equal(body.message, "Authentication required.");
    }
});

test("client sessions cannot reach the admin workspace views", async () => {
    const token = jwt.sign(
        { sub: "client-id", role: "client", email: "c@example.com" },
        env.jwtSecret,
    );
    const headers = { Authorization: `Bearer ${token}` };
    for (const path of [
        "/api/admin/tickets",
        "/api/admin/companies",
        "/api/admin/team",
    ]) {
        const { response, body } = await request(path, { headers });
        assert.equal(response.status, 403);
        assert.equal(body.message, "Admin access required.");
    }
});

test("support query triage rejects an unknown status", async () => {
    const token = jwt.sign(
        { sub: "admin-id", role: "admin", email: "a@example.com" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/tickets/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Closed" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Invalid support query status.");
});

test("support query triage rejects an unknown priority", async () => {
    const token = jwt.sign(
        { sub: "admin-id", role: "admin", email: "a@example.com" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/tickets/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ priority: "Whenever" }),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Invalid support query priority.");
});

test("support query triage requires at least one field", async () => {
    const token = jwt.sign(
        { sub: "admin-id", role: "admin", email: "a@example.com" },
        env.jwtSecret,
    );
    const { response, body } = await request(
        "/api/admin/tickets/000000000000000000000000",
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        },
    );
    assert.equal(response.status, 400);
    assert.equal(body.message, "Provide a status or priority to update.");
});

test("support query triage rejects malformed ids", async () => {
    const token = jwt.sign(
        { sub: "admin-id", role: "admin", email: "a@example.com" },
        env.jwtSecret,
    );
    const { response, body } = await request("/api/admin/tickets/not-an-id", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Resolved" }),
    });
    assert.equal(response.status, 404);
    assert.equal(body.message, "Support query not found.");
});

test("workspace views wait for the database instead of leaking an error", async () => {
    const token = jwt.sign(
        { sub: "admin-id", role: "admin", email: "a@example.com" },
        env.jwtSecret,
    );
    const headers = { Authorization: `Bearer ${token}` };
    const expected = {
        "/api/admin/tickets": "Support queries are temporarily unavailable.",
        "/api/admin/companies": "Client companies are temporarily unavailable.",
        "/api/admin/team": "Team members are temporarily unavailable.",
    };
    for (const [path, message] of Object.entries(expected)) {
        const { response, body } = await request(path, { headers });
        assert.equal(response.status, 503);
        assert.equal(body.message, message);
    }
});
