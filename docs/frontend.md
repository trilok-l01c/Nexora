# Frontend

The frontend is a Next.js App Router application in `client/`.

## Public experience

- Homepage with service and solution dropdowns.
- Individual service pages under `/services/[slug]`.
- Enquiry form in the home contact section that creates a lead.
- Public Sign In opens the authentication dialog; signup is client-only.
- Client routes: `/client/login`, `/client/dashboard`, and `/client/projects/[projectId]`.

## Contact form

The form sends JSON to `${NEXT_PUBLIC_API_URL}/api/contact` with:

```ts
{
  name,
  email,
  phone,   // optional
  company, // optional
  service,
  message,
}
```

The submission is stored as a lead with `status: "new"`. It does not create a client account; conversion happens later through the admin workflow.

## Admin interface

Open `/admin` to sign in and work in the internal workspace. After login the page renders a responsive sidebar (a drawer on small screens) with one tab per responsibility: Overview, Leads, Queries & Support, Projects, Portfolio, Site Content, Clients & Companies, and Account & Settings. The active tab is mirrored into the URL hash so a reload keeps the same tab.

Shared server state lives in `AdminDataProvider` (`client/src/app/admin/AdminDataContext.tsx`) so switching tabs does not re-fetch the same lists. Each section owns only the slice of UI it needs, and all styling comes from `workspace.module.css` (white surfaces, Nexora green and blue accents, independent of the public site's dark-theme toggle).

The workspace uses cookie credentials for:

- `POST /api/admin/login` and `POST /api/admin/logout`
- `GET /api/auth/session` (shared client-session context, used for the signed-in admin identity)
- `GET /api/admin/leads` (plus detail, status, note, and convert endpoints)
- `GET /api/admin/projects` and `PATCH /api/admin/projects/:id`
- `GET /api/admin/tickets` and `PATCH /api/admin/tickets/:id`
- `GET /api/admin/companies` and `GET /api/admin/team`
- `GET/PATCH /api/admin/home`
- `GET /api/admin/portfolio` (plus create, update, delete, updates, and image upload)

The lead inbox supports status filters, search, inline contact-detail editing, status updates (converted leads show a conversion banner instead of the status dropdown), an internal note timeline (add/edit staff notes; automatic status/converted entries are read-only), and an explicit convert-to-client form that provisions the portal account.

Destructive actions (deleting a portfolio project or one of its updates) are staged and confirmed in a shared dialog instead of using a blocking `window.confirm`. Sign-out is confirmed the same way.

## Design constraint

The existing public frontend should be preserved. Backend additions should only change frontend code when needed to connect an existing workflow.
