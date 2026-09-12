# Authentication

Nexora has separate admin and client authentication. The public website offers a modal client sign-in/sign-up flow; admin/staff accounts are still provisioned through the secure admin process. There is no Google OAuth or Facebook OAuth.

## Admin bootstrap

On server startup, if MongoDB is available and no user exists for `ADMIN_EMAIL`, the server creates one using `ADMIN_PASSWORD`. The password is hashed with bcrypt. Raw passwords and password hashes are never returned by the API.

## Login

`POST /api/admin/login` validates credentials and sets an HttpOnly cookie named `nexora_admin_token`. The cookie uses `SameSite=Lax` and becomes `Secure` in production.

`POST /api/auth/login` validates client credentials and sets an HttpOnly cookie named `nexora_client_token`. A client token includes the authenticated user's company id, which is required for company-scoped project access. Successful client authentication routes to `/client/dashboard`; the existing admin login routes to `/admin`.

## Client signup

`POST /api/auth/signup` accepts `name`, `email`, `company`, `password`, and `confirmPassword`. The backend validates every field, hashes the password, always assigns the `client` role, and either finds the existing company by name or creates one. It never accepts a role from the request and does not assign projects during registration. Existing email addresses return `409`.

The frontend sends authenticated requests with `credentials: "include"`.

## Protected routes

`authenticateAdmin` accepts the admin cookie or an `Authorization: Bearer <token>` header. `authenticateClient` accepts the client cookie or a Bearer token and requires both the `client` role and a company id. Invalid, expired, or missing credentials return `401`; wrong roles or missing company context return `403`.

## Logout

`POST /api/admin/logout` and `POST /api/auth/logout` clear the session cookies. Subsequent protected requests fail until the user logs in again.

## Production requirements

- Set a strong random `JWT_SECRET`.
- Set `NODE_ENV=production`.
- Use HTTPS.
- Restrict `CORS_ORIGIN` to the deployed frontend origin.
- Keep `.env` outside source control.
- Rotate credentials if exposed.
