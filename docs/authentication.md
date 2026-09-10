# Authentication

Nexora has admin authentication only. There is no public registration, public login, Google OAuth, or Facebook OAuth.

## Admin bootstrap

On server startup, if MongoDB is available and no user exists for `ADMIN_EMAIL`, the server creates one using `ADMIN_PASSWORD`. The password is hashed with bcrypt. Raw passwords and password hashes are never returned by the API.

## Login

`POST /api/admin/login` validates credentials and sets an HttpOnly cookie named `nexora_admin_token`. The cookie uses `SameSite=Lax` and becomes `Secure` in production.

The frontend sends authenticated requests with `credentials: "include"`.

## Protected routes

`authenticateAdmin` accepts the cookie or an `Authorization: Bearer <token>` header. Invalid, expired, or missing credentials return `401`; valid non-admin roles return `403`.

## Logout

`POST /api/admin/logout` clears the cookie. Subsequent protected requests fail until the admin logs in again.

## Production requirements

- Set a strong random `JWT_SECRET`.
- Set `NODE_ENV=production`.
- Use HTTPS.
- Restrict `CORS_ORIGIN` to the deployed frontend origin.
- Keep `.env` outside source control.
- Rotate credentials if exposed.
