# Frontend

The frontend is a Next.js App Router application in `client/`.

## Public experience

- Homepage with service and solution dropdowns.
- Individual service pages under `/services/[slug]`.
- Contact form under the Approach section.
- Static company contact email link.
- Public Sign In opens the authentication dialog; signup is client-only.
- Client routes: `/client/login`, `/client/dashboard`, and `/client/projects/[projectId]`.

## Contact form

The form sends JSON to `${NEXT_PUBLIC_API_URL}/api/contact` with:

```ts
{
  name,
  email,
  company,
  service,
  message,
}
```

The message is stored as a general enquiry. It does not create a CRM lead or upload attachments.

## Admin interface

Open `/admin` to log in and manage project requests. The page uses cookie credentials for:

- `POST /api/admin/login`
- `GET /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `POST /api/admin/logout`

## Design constraint

The existing public frontend should be preserved. Backend additions should only change frontend code when needed to connect an existing workflow.
