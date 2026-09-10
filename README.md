# Nexora IT solutions and social media management company

## Projects

- `client/` contains the completed Next.js frontend.
- `server/` contains the Express API for contact and lead submissions.

## Backend setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` to a reachable MongoDB database before accepting leads. The API still starts without MongoDB so health checks and validation can run, but valid contact submissions return `503` until the database is available.

Environment variables:

| Variable         | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string                                 |
| `PORT`           | API port, default `4292`                                  |
| `CORS_ORIGIN`    | Comma-separated allowed frontend origins                  |
| `ADMIN_EMAIL`    | Admin email used to initialize the first admin account    |
| `ADMIN_PASSWORD` | Admin password used once to initialize the hashed account |
| `JWT_SECRET`     | Secret used to sign login tokens                          |
| `JWT_EXPIRES_IN` | Token lifetime, default `2h`                              |

## API

### `POST /api/contact`

Accepts JSON and creates a lead. Required fields are `name`, `email`, `service`, and `message`. Optional fields are `phone` and `company`.

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

Successful creation returns `201`:

```json
{
    "success": true,
    "message": "Your request has been submitted successfully."
}
```

Validation errors return `400`, malformed JSON returns `400`, rate-limited requests return `429`, and unavailable persistence returns `503`.

### `POST /api/auth/login`

Authenticates the configured admin account. On first startup with a working MongoDB connection, the account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` is created with a bcrypt password hash. The raw password is never stored.

```json
{
    "email": "admin@nexora.studio",
    "password": "your-admin-password"
}
```

The successful response contains a short-lived JWT:

```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "token": "eyJ...",
        "expiresIn": "2h",
        "user": { "email": "admin@nexora.studio", "role": "admin" }
    }
}
```

Login is rate limited and invalid credentials return `401` without revealing which field failed.

### `GET /api/contact`

Internal use only. Requires the JWT from the login endpoint and must not be called from the public browser:

```bash
curl http://localhost:4292/api/contact \
    -H 'Authorization: Bearer eyJ...'
```

The endpoint returns `401` without a valid token and leads newest first. Submitted customer information is not publicly exposed.

### Health checks

- `GET /api` confirms that the API is running.
- `GET /api/health` returns `{ "success": true, "status": "ok" }`.

## Database

The `Contact` Mongoose model stores:

- `name`, `email`, `service`, and `message`
- optional `phone` and `company`
- `status`: `new`, `contacted`, `in_progress`, or `completed`
- `createdAt` and `updatedAt` timestamps

## Structure

```text
server/
├── config/
│   ├── database.js
│   └── env.js
├── controllers/contactController.js
├── controllers/authController.js
├── middleware/
│   ├── authenticateAdmin.js
│   ├── errorHandler.js
│   ├── validateLogin.js
│   └── validateContact.js
├── models/
│   ├── Contact.js
│   └── User.js
├── routes/authRoutes.js
├── routes/contactRoutes.js
├── services/adminBootstrap.js
├── app.js
└── server.js
```

## Frontend integration

The current frontend keeps its published company email link unchanged. A future form can submit to the API from the browser:

```ts
await fetch("http://localhost:4292/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, company, service, message }),
});
```

For production, set `CORS_ORIGIN` to the deployed frontend origin and use HTTPS. Never put `ADMIN_PASSWORD`, `JWT_SECRET`, or MongoDB credentials in frontend code or source control. Replace the local development values before deployment and rotate them if exposed.
