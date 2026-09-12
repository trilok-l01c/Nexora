# API Reference

Base URL: `http://localhost:4292`

All responses use JSON. Errors follow this shape:

```json
{ "success": false, "message": "Readable error message." }
```

## Public endpoints

### `GET /api`

Returns API availability.

### `GET /api/health`

Returns service health.

### `POST /api/contact`

Creates a lead using `multipart/form-data`. Required fields are `name`, `email`, `service`, and `message`. Optional fields are `phone`, `company`, and repeated `attachments` file fields. Up to five files are accepted, at 10 MB per file. Accepted types are PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, JPG/JPEG, PNG, and WebP.

```bash
curl -X POST http://localhost:4292/api/contact \
    -F 'name=John Doe' \
    -F 'email=john@example.com' \
    -F 'phone=+254700000000' \
    -F 'company=Example Ltd' \
    -F 'service=Software development' \
    -F 'message=We need a website for our business.' \
    -F 'attachments=@project-brief.pdf'
```

Success: `201`.

## Admin endpoints

All admin endpoints require the HttpOnly auth cookie created by login. A Bearer JWT is also accepted for API clients.

### `POST /api/admin/login`

```json
{ "email": "admin@example.com", "password": "your-password" }
```

Returns `200` and sets the authentication cookie.

### `POST /api/admin/logout`

Clears the authentication cookie.

### `GET /api/admin/leads`

Returns leads newest first. Filter with `?status=new`, `contacted`, `in_progress`, `completed`, or `rejected`.

### `GET /api/admin/leads/:id`

Returns one lead or `404`.

Each lead includes attachment metadata and an authenticated `downloadUrl`; the stored filesystem path is never returned.

### `PATCH /api/admin/leads/:id/status`

```json
{ "status": "contacted" }
```

Allowed statuses: `new`, `contacted`, `in_progress`, `completed`, `rejected`.

### `GET /api/admin/leads/:id/attachments/:attachmentId`

Downloads one lead attachment. Requires the admin HttpOnly cookie and never exposes the upload directory publicly.

## Client authentication and portal endpoints

### `POST /api/auth/signup`

Creates a client account from `name`, `email`, `company`, `password`, and `confirmPassword`. The backend always sets `role: "client"`, reuses an exact case-insensitive company name when present, and creates no project assignments. Returns `409` for a duplicate email.

### `POST /api/auth/login`

Authenticates a client and sets the HttpOnly `nexora_client_token` cookie.

### `POST /api/auth/logout`

Clears client and admin session cookies.

The following routes require the client session cookie and scope all project access to the authenticated user's `companyId`:

- `GET /api/client/dashboard` returns the client's company, projects, recent activity, and support tickets.
- `GET /api/client/projects/:projectId` returns project details only when the project belongs to the authenticated user's company; otherwise it returns `404`.
- `POST /api/client/tickets` creates a support request. An optional `projectId` is checked against the same company before association.

## Status flow

- `new` -> `contacted` or `rejected`
- `contacted` -> `in_progress` or `rejected`
- `in_progress` -> `completed` or `rejected`
- `completed` and `rejected` remain final

## Compatibility routes

Existing clients may continue using `POST /api/auth/login`, `POST /api/auth/logout`, and protected `GET /api/contact`. New integrations should use `/api/admin/*`.
