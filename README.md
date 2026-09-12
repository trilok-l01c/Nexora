# Nexora

Nexora is an IT solutions company website with a Next.js frontend, Express API, MongoDB enquiry and project storage, a private admin workspace, and a company-scoped client portal. The primary workflow is public website -> authentication -> company/client -> projects -> team, progress, technology, updates, and support.

## Stack and structure

- `client/`: Next.js App Router frontend and admin interface.
- `server/`: Express API, Mongoose models, validation, authentication, and services.
- MongoDB stores general enquiries, users, companies, projects, project updates, and support tickets.

## Quick start

Requirements: Node.js, npm, and MongoDB or MongoDB Atlas.

```bash
npm --prefix server install
npm --prefix client install
cp server/.env.example server/.env
```

Set real values in `server/.env`, then start both applications:

```bash
npm --prefix server run dev
npm --prefix client run dev
```

Open `http://localhost:3000` for the public website, `/admin` for the private admin dashboard, and `/client/login` for client access.

The client may use `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4292
```

Never commit `server/.env`, `client/.env.local`, or `server/storage/uploads/`.

## Environment variables

| Variable         | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string.                               |
| `PORT`           | API port, normally `4292`.                               |
| `CORS_ORIGIN`    | Allowed frontend origin(s), comma-separated.             |
| `ADMIN_EMAIL`    | Admin account created during server bootstrap.           |
| `ADMIN_PASSWORD` | Bootstrap password; stored as a bcrypt hash.             |
| `JWT_SECRET`     | Secret for the admin session token.                      |
| `JWT_EXPIRES_IN` | JWT lifetime, such as `2h`.                              |
| `UPLOAD_DIR`     | Private attachment directory, default `storage/uploads`. |
| `NODE_ENV`       | `development` or `production`.                           |

## API and authentication

Public contact submissions use `POST /api/contact` and accept multipart form data with required `name`, `email`, `service`, and `message`; `phone`, `company`, and up to five `attachments` are optional. Each attachment may be up to 10 MB and must be a PDF, common Office document, text file, or PNG/JPEG/WebP image.

Admin-only endpoints are:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/leads?status=new`
- `GET /api/admin/leads/:id`
- `PATCH /api/admin/leads/:id/status`
- `GET /api/admin/leads/:id/attachments/:attachmentId`
- `GET/PATCH /api/admin/home`
- `GET/POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`

Client portal endpoints are:

- `POST /api/auth/login` and `POST /api/auth/logout`
- `GET /api/client/dashboard`
- `GET /api/client/projects/:projectId`
- `POST /api/client/tickets`

## Client dashboard architecture

Client routes live under `/client`: `/client/login`, `/client/dashboard`, and `/client/projects/[projectId]`. The portal renders overview counts, company projects, activity, support tickets, project milestones, updates, team members, and grouped technology stacks from API data. Empty, loading, unauthorized, and service-unavailable states are handled in the portal UI.

The data relationship is `User.companyId -> Company -> Project.companyId`. Projects contain references to professional team users plus embedded milestones, updates, activity, and grouped technologies. Tickets reference the company, creator, and optional project. Admin project endpoints are the staff write path for project status, progress, dates, team, milestones, updates, and technologies.

Client sessions use a separate HttpOnly `nexora_client_token` cookie. The client middleware requires a `client` JWT with a company id. Every project read and ticket project association filters by both the requested project id and the authenticated user's company id, returning `404` when the project is not in that company. Team population is restricted to name, professional title, professional bio, and avatar URL; private credentials and personal contact data are never returned.

Admin login uses a short-lived JWT in an HttpOnly cookie. The public website includes a modal client sign-in/sign-up flow. `POST /api/auth/signup` validates name, work email, company, password, and confirmation, always assigns the `client` role, reuses an existing company by name, and never grants project access until staff assigns projects. Duplicate emails return `409`. Admin/staff accounts are not created through public signup and the existing `/admin` workflow remains separate. See [docs/api.md](docs/api.md) and [docs/authentication.md](docs/authentication.md) for request details.

## Project-first workflow

New client requests are created as `Pending Review` with `0%` progress. Staff controls status, progress, dates, team, milestones, technologies, and updates through authenticated admin project operations. Client reads and support tickets are always scoped to the authenticated user's company.

The former lead inbox, lead status lifecycle, lead attachments, and lead conversion workflow have been removed. Public contact is now a lightweight general enquiry stored as `Enquiry`; it is not a CRM lead and has no admin lead API or attachment system.

## Testing and production notes

```bash
npm --prefix server test
npm --prefix client run lint
npm --prefix client run build
```

The server validates untrusted input, limits JSON and multipart payloads, rate-limits contact and admin-login routes, uses Helmet and configured CORS, and returns safe error messages. For production, use HTTPS, a strong secret, a managed/private MongoDB deployment, persistent private file storage or object storage, and a backup/retention policy for uploaded files. Email notifications are intentionally not enabled yet; the lead controller remains the integration point for a future `emailService`.

## Browser extension note

If Next.js reports a hydration mismatch containing `one-sec-browser-extension-id` or injected inline styles on form controls, test in a private window with browser extensions disabled. The One Sec extension modifies the server-rendered DOM after delivery; the application renders consistently in a clean browser session, so this warning should not be addressed with `suppressHydrationWarning` or client-only rendering hacks.

## More documentation

- [Setup](docs/setup.md)
- [API reference](docs/api.md)
- [Authentication](docs/authentication.md)
- [Database models](docs/database.md)
- [Frontend integration](docs/frontend.md)
- [Testing](docs/testing.md)
- [Architecture](docs/architecture.md)
