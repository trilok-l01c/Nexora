# Setup

## Requirements

- Node.js
- npm
- MongoDB or MongoDB Atlas

## Install

```bash
npm --prefix server install
npm --prefix client install
```

## Configure the server

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` in `server/.env`. Never commit this file.

## Start development servers

Backend:

```bash
npm --prefix server run dev
```

Frontend:

```bash
npm --prefix client run dev
```

Open `http://localhost:3000`.

## Environment variables

| Variable         | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string                               |
| `PORT`           | API port, normally `4292`                               |
| `CORS_ORIGIN`    | Allowed frontend origin(s), comma-separated             |
| `NODE_ENV`       | `development` or `production`                           |
| `ADMIN_EMAIL`    | Admin account email used during bootstrap               |
| `ADMIN_PASSWORD` | Admin account password, hashed before storage           |
| `JWT_SECRET`     | Secret used to sign admin tokens                        |
| `JWT_EXPIRES_IN` | Token lifetime, such as `2h`                            |
| `UPLOAD_DIR`     | Private attachment directory, default `storage/uploads` |

The client uses `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4292
```

The server creates `UPLOAD_DIR` when it starts. Keep this directory outside any static/public web root and use persistent private storage in production.
