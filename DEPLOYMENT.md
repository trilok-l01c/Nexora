# Deployment guide

Nexora is deployed as two services: the Next.js frontend on Netlify and the
Express API on a Docker-capable host. MongoDB and S3-compatible object storage
are external managed services. The API must be deployed before the frontend.

## 1. Deploy the API

Build the image from the repository root:

```bash
docker build -t nexora-api ./server
```

Run the container on a Docker-capable platform with a public HTTPS domain such
as `https://api.example.com`. The service runs `npm start`, listens on the
platform-provided `PORT`, and exposes `GET /api/health` for health checks.
Configure the health check to request `/api/health` and accept HTTP 200.

Set these API environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV=production` | Yes | Enables production validation and secure cookies. |
| `PORT` | Platform-dependent | Port supplied by the host. |
| `MONGODB_URI` | Yes | MongoDB/Atlas connection string. |
| `JWT_SECRET` | Yes | At least 32 random characters; keep secret and rotate deliberately. |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `2h`. |
| `ADMIN_EMAIL` | Yes | Bootstrap administrator email. |
| `ADMIN_PASSWORD` | Yes | Bootstrap administrator password. |
| `CORS_ORIGIN` | Yes | Comma-separated, explicit frontend HTTPS origins. |
| `COOKIE_SAME_SITE` | No | `lax` (default), `strict`, or `none`; see Authentication. |
| `COOKIE_DOMAIN` | No | Shared cookie domain, e.g. `.example.com`; normally leave unset. |
| `STORAGE_DRIVER=s3` | Yes | Enables durable object storage. |
| `S3_ENDPOINT` | Provider-dependent | Endpoint for a non-AWS S3-compatible provider. |
| `S3_REGION` | No | Defaults to `us-east-1`. |
| `S3_BUCKET` | Yes | Bucket for portfolio uploads. |
| `S3_ACCESS_KEY_ID` | Yes | Restricted object-storage credential. |
| `S3_SECRET_ACCESS_KEY` | Yes | Matching secret credential. |
| `S3_PUBLIC_URL` | Yes | HTTPS public/CDN base URL for the bucket, without a trailing slash. |

Set a bucket policy/CDN so uploaded objects can be read at
`S3_PUBLIC_URL/uploads/<file>`. The application deliberately does not make S3
objects public using upload-time ACLs; this works with providers that disable
ACLs. Grant the API credential only the object permissions it needs for that
bucket. Local filesystem uploads (`STORAGE_DRIVER=local`) are development-only
and are rejected when `NODE_ENV=production`.

Provision MongoDB with a network rule that permits the API host only, then set
`MONGODB_URI`. Never put API, database, or S3 credentials in the frontend,
repository, image, or Netlify variables.

## 2. Configure the frontend on Netlify

Connect this repository in Netlify. The checked-in `netlify.toml` configures:

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `.next`

Netlify detects the current Next.js adapter automatically. In the site
environment variables (with the **Builds** scope), set:

| Variable | Example |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://app.example.com` |

These are public build-time values, so do not store secrets in them. Redeploy
after changing either variable. Attach the frontend custom domain, for example
`app.example.com`, and set the API's `CORS_ORIGIN=https://app.example.com`.

## Authentication and CORS

The recommended configuration is `https://app.example.com` and
`https://api.example.com`. They are HTTPS same-site subdomains, so the default
`COOKIE_SAME_SITE=lax`, `HttpOnly`, and `Secure` cookies work with browser
requests that use `credentials: "include"`. The client already includes those
credentials for session and authenticated API calls. Cookies are host-only by
default, which keeps them scoped to the API host; `COOKIE_DOMAIN` is optional
and should be set only when a shared cookie domain is truly necessary.

`CORS_ORIGIN` is an explicit allowlist and never supports `*` alongside
credentials. For a temporary Netlify URL (`https://site-name.netlify.app`) that
calls an API on a different site, set that exact URL in `CORS_ORIGIN` and set
`COOKIE_SAME_SITE=none`. HTTPS is mandatory; the API always adds `Secure` to
production cookies. Add only the exact deploy-preview URL(s) that require
authenticated testing and remove them afterward. A wildcard such as
`*.netlify.app` is intentionally unsupported.

## Final smoke test

1. Verify `https://api.example.com/api/health` returns `200`.
2. Deploy the Netlify site with both public variables configured.
3. Submit the contact form and confirm its lead appears in MongoDB/admin.
4. Log in as admin and as a client; verify authenticated requests remain
   signed in after a refresh.
5. Upload a portfolio image, open the returned image URL, then restart the API
   and verify the image still loads.
