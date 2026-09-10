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

Creates a lead. Required fields: `name`, `email`, `service`, `message`. Optional fields: `phone`, `company`.

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254700000000",
    "company": "Example Ltd",
    "service": "Software development",
    "message": "We need a website for our business."
}
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

### `PATCH /api/admin/leads/:id/status`

```json
{ "status": "contacted" }
```

Allowed statuses: `new`, `contacted`, `in_progress`, `completed`, `rejected`.

## Status flow

- `new` -> `contacted` or `rejected`
- `contacted` -> `in_progress` or `rejected`
- `in_progress` -> `completed` or `rejected`
- `completed` and `rejected` remain final

## Compatibility routes

Existing clients may continue using `POST /api/auth/login`, `POST /api/auth/logout`, and protected `GET /api/contact`. New integrations should use `/api/admin/*`.
