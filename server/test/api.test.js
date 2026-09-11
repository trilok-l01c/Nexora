import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../app.js";

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
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
    assert.deepEqual(body, { success: true, status: "ok" });
});

test("contact validation rejects missing required fields", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "client@example.com" }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.match(body.message, /name is required/i);
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
    assert.equal(body.message, "Invalid email address.");
});

test("contact validation rejects unsupported file types", async () => {
    const payload = new FormData();
    payload.append("name", "Client");
    payload.append("email", "client@example.com");
    payload.append("service", "Software development");
    payload.append("message", "Project details");
    payload.append(
        "attachments",
        new Blob(["executable"], { type: "application/x-msdownload" }),
        "malware.exe",
    );

    const { response, body } = await request("/api/contact", {
        method: "POST",
        body: payload,
    });
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
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
    assert.equal(
        body.message,
        "Contact submissions are temporarily unavailable.",
    );
});

test("admin leads reject unauthenticated requests", async () => {
    const { response, body } = await request("/api/admin/leads");
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

test("malformed JSON returns a safe client error", async () => {
    const { response, body } = await request("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{broken",
    });
    assert.equal(response.status, 400);
    assert.equal(body.message, "Malformed JSON request body.");
});
