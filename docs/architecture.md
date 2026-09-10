# Architecture

## Repository layout

```text
Nexora/
├── client/              Next.js frontend
├── server/              Express API
├── docs/                Project documentation
└── README.md            Documentation index
```

## Server layout

```text
server/
├── config/              Environment and MongoDB connection
├── controllers/         Request handlers
├── middleware/          Validation, auth, and errors
├── models/              Mongoose schemas
├── routes/              REST route definitions
├── services/            Startup/admin services
├── app.js               Express middleware and route mounting
└── server.js            Database startup and HTTP listener
```

## Request flow

Public contact requests pass through body parsing, rate limiting, validation, and MongoDB persistence. Admin requests pass through authentication before lead queries or status updates. Errors are converted into consistent JSON responses by centralized middleware.

## Email notifications

Email notification is intentionally not implemented yet. A future `server/services/emailService.js` can be called after successful lead creation without changing the public contact API.
