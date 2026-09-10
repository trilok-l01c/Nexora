# Nexora

Nexora is an IT solutions company website with a Next.js frontend, Express API, MongoDB lead storage, and a private admin dashboard.

## Documentation

- [Project overview](docs/overview.md)
- [Setup and environment](docs/setup.md)
- [API reference](docs/api.md)
- [Authentication](docs/authentication.md)
- [Database models](docs/database.md)
- [Frontend integration](docs/frontend.md)
- [Testing guide](docs/testing.md)
- [Architecture](docs/architecture.md)

## Quick start

Install dependencies:

```bash
npm --prefix server install
npm --prefix client install
```

Start the backend:

```bash
npm --prefix server run dev
```

Start the frontend in another terminal:

```bash
npm --prefix client run dev
```

Open `http://localhost:3000` for the website and `http://localhost:3000/admin` for the private lead dashboard.

Never commit `server/.env` or `client/.env.local`.
