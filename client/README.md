# Nexora Client

Next.js frontend for the Nexora IT solutions website.

## Run

From the repository root:

```bash
npm --prefix client install
npm --prefix client run dev
```

Open `http://localhost:3000`.

## Routes

- `/`: public company website
- `/services/[slug]`: service landing pages
- `/admin`: private admin login and project operations workspace
- `/client/login`: client sign-in fallback page
- `/client/dashboard`: authenticated company project dashboard

## Configuration

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4292
```

See the root [frontend documentation](../docs/frontend.md) and [setup guide](../docs/setup.md) for integration details.
