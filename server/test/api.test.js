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
