# Frontend

The frontend is a Next.js App Router application in `client/`.

## Public experience

- Homepage with service and solution dropdowns.
- Individual service pages under `/services/[slug]`.
- Contact form under the Approach section.
- Static company contact email link.
- No public login or sign-up controls.

## Contact form

The form sends `multipart/form-data` to `${NEXT_PUBLIC_API_URL}/api/contact` with:

```ts
{
  name,
  email,
  phone,
  company,
  service,
  message,
  attachments,
}
```

Attachments are optional. The UI accepts up to five files and shows loading, success, and API error feedback. The submit button is disabled while sending.

## Admin interface

Open `/admin` to log in and manage leads. The page uses cookie credentials for:

- `POST /api/admin/login`
- `GET /api/admin/leads`
- `PATCH /api/admin/leads/:id/status`
- `POST /api/admin/logout`

Lead attachments are rendered as links to authenticated admin download endpoints.

## Design constraint

The existing public frontend should be preserved. Backend additions should only change frontend code when needed to connect an existing workflow.
