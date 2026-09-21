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

Open `/admin` to log in and manage leads, project requests, homepage content, and portfolio content. The page uses cookie credentials for:

- `POST /api/admin/login`
- `GET /api/admin/leads` (plus detail, status, note, and convert endpoints)
- `GET /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `POST /api/admin/logout`

The lead inbox supports status filters, inline contact-detail editing, status updates (converted leads show a conversion banner instead of the status dropdown), an internal note timeline (add/edit staff notes; automatic status/converted entries are read-only), and an explicit convert-to-client form that provisions the portal account.

## Design constraint

The existing public frontend should be preserved. Backend additions should only change frontend code when needed to connect an existing workflow.
