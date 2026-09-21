# API Reference

Base URL: `http://localhost:4292`

All responses use JSON and errors follow `{ "success": false, "message": "Readable error message." }`.

## Public endpoints

`GET /api` and `GET /api/health` report API availability.

### `POST /api/contact`

Creates a lead for the Nexora team to follow up on. Required fields are `name`, `email`, `service`, and `message`; `phone` and `company` are optional. The lead is stored with `source: "website"` and `status: "new"` and never creates accounts, clients, or projects.

```bash
curl -X POST http://localhost:4292/api/contact \
    -H 'Content-Type: application/json' \
    -d '{"name":"John Doe","email":"john@example.com","company":"Example Ltd","service":"Software development","message":"We need a website for our business."}'
```

## Authentication

### `POST /api/auth/signup`

Creates a client account from `name`, `email`, `company`, `password`, and `confirmPassword`. The server always assigns `client`, reuses an existing company by name, and creates no project assignments. Duplicate email returns `409`.

### `POST /api/auth/login`

Authenticates a client and sets the HttpOnly `nexora_client_token` cookie.

### `POST /api/auth/logout`

Clears client and admin session cookies.

### `POST /api/admin/login`

Authenticates an admin and sets the HttpOnly `nexora_admin_token` cookie.

## Admin project endpoints

All admin endpoints require the admin session cookie or Bearer JWT.

- `GET /api/admin/projects` returns project requests and active projects for staff review.
- `PATCH /api/admin/projects/:id` updates staff-controlled status, progress, dates, team, technologies, milestones, and updates. Company ownership and client request fields are not changed here.
- `GET/PATCH /api/admin/home` manages editable homepage content.
- `POST /api/admin/logout` clears the admin session.

## Admin lead endpoints

All lead endpoints require the admin session cookie or Bearer JWT; client sessions are rejected with `403`.

- `GET /api/admin/leads` lists leads, newest first. Optional `?status=new|contacted|in_progress|completed|rejected` filter; an unknown status returns `400`.
- `GET /api/admin/leads/:id` returns one lead including its relationship timeline. Unknown or malformed ids return `404`.
- `PATCH /api/admin/leads/:id` updates contact details (`name`, `email`, `phone`, `company`, `service`) and optionally re-classifies `source` (`website`, `manual`, `referral`, `other`). Only provided fields are applied.
- `PATCH /api/admin/leads/:id/status` moves the lead through the lifecycle. Allowed transitions: `new -> contacted|rejected`, `contacted -> in_progress|rejected`, `in_progress -> rejected`; `rejected` is terminal. `completed` ("converted to client") is not settable here — only the conversion endpoint can produce it, so a mis-click can never fake a conversion. Illegal moves return `400`. Each change is appended to the timeline.
- `POST /api/admin/leads/:id/notes` appends an internal note (`text`, max 2000 chars). `PATCH /api/admin/leads/:id/notes/:noteId` edits a staff note; automatic timeline entries cannot be edited.
- `POST /api/admin/leads/:id/convert` converts the lead into a client. Body: `companyName`, `clientName`, `email`, `phone` (optional), `password` (min 8 chars, initial portal password shared with the client outside this system). It reuses an existing company with the same name (case-insensitive) or creates one, creates a `client` user with the given password, sets the lead to `completed`, and stamps `convertedCompanyId`, `convertedUserId`, and `convertedAt`. Responses: `200` with the lead, company, and user; `409` when the email is already registered or the lead was already converted.

## Client project and support endpoints

These routes require the client session cookie and scope every resource to the authenticated user's `companyId`.

- `GET /api/client/dashboard` returns the company dashboard payload.
- `GET /api/projects` returns only the client's company projects.
- `POST /api/projects` creates a project request. The server derives `companyId` from the session, ignores any client-supplied ownership, and initializes `Pending Review` with `0%` progress.
- `GET /api/projects/:projectId` returns a project only when it belongs to the client company; otherwise it returns `404`.
- `GET /api/client/projects/:projectId` is the portal detail equivalent.
- `POST /api/client/tickets` creates a support ticket. An optional project id is checked against the same company.

## Project lifecycle

Client requests begin at `Pending Review` and `0%`. Authorized staff may move them through `Planning`, `Design`, `Development`, `Testing`, `Review`, `Deployment`, `Completed`, or `On Hold` and maintain project team, milestones, technologies, and updates.
