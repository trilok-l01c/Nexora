# Testing

## Static checks

```bash
npm --prefix server test
npm --prefix client run lint
npm --prefix client run build
```

The server test suite includes request-level checks for health, lead/enquiry validation, unavailable database handling, admin route protection (including lead endpoints), protected project routes, signup validation, logout, and malformed JSON. It also unit-tests the lead lifecycle rules. These API tests do not require a running MongoDB instance, so any code path that needs a live connection (lead creation and reads, status changes, notes, conversion) is exercised only down to the `503` database guard — the DB-backed happy paths must be verified manually with the checks below.

## Manual API checks

Start the backend first:

```bash
npm --prefix server start
```

Check health:

```bash
curl http://localhost:4292/api/health
```

Test a contact submission:

```bash
curl -X POST http://localhost:4292/api/contact \
  -F 'name=Test User' \
  -F 'email=test@example.com' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","company":"Example","service":"Software development","message":"Test request"}'
```

Test admin login with a cookie jar:

```bash
curl -c cookies.txt -b cookies.txt -X POST http://localhost:4292/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Then test protected project access, project updates, and logout using the same cookie jar.

## Cases to verify

- Missing name, email, service, or message
- Invalid email or phone
- Oversized input
- Malformed JSON
- Invalid credentials
- Missing authentication
- Invalid lead status, note, or conversion payloads
- Invalid project ID
- Cross-company project access rejection
- Client project creation ignores a supplied company id
- Logout followed by a protected request
- CORS from the configured frontend origin

With MongoDB running, also verify the lead workflow end to end:

- A public `POST /api/contact` submission appears in `GET /api/admin/leads` with `source: "website"` and `status: "new"`, and creates no user, company, or project.
- `PATCH /api/admin/leads/:id/status` walks `new -> contacted -> in_progress` and rejects `in_progress -> completed` (conversion is the only path to `completed`).
- `POST /api/admin/leads/:id/notes` appends to the timeline, and `PATCH /api/admin/leads/:id/notes/:noteId` edits staff notes only.
- `POST /api/admin/leads/:id/convert` creates or reuses the company, creates the `client` user, sets the lead to `completed`, and returns `409` for an already-registered email or an already-converted lead.
- The converted client can log in to `/client/login` and is scoped to its own company's projects.

## Legacy data migration

If the database still holds pre-Lead `contacts` documents (the previous lead inbox) or `enquiries` documents (the interim general-enquiry form), copy them into the lead inbox with:

```bash
node --env-file=.env scripts/migrateLegacyLeads.js
```

The script is idempotent and non-destructive: it only inserts missing leads, preserves the original `createdAt`, and never deletes or modifies the `contacts` or `enquiries` collections — so it can be re-run and the legacy data dropped separately once the result has been checked. Legacy `completed` rows become `in_progress` leads with the old status recorded on the timeline, so the conversion decision stays explicit.
