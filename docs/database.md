# Database

MongoDB is connected through Mongoose in `server/config/database.js`.

## Enquiry model

Stored fields:

- `name`: required string, max 100 characters
- `email`: required normalized string, max 254 characters
- `company`: optional string, max 160 characters
- `service`: optional string, max 120 characters
- `message`: required string, max 5000 characters
- `createdAt` and `updatedAt`: automatic timestamps

## User model

Stored fields:

- `email`: unique normalized email
- `passwordHash`: bcrypt hash, excluded from normal queries
- `role`: `admin`, `staff`, or `client`
- `companyId`: company reference for clients and staff
- `active`: account switch
- `createdAt` and `updatedAt`

## Company and project relationships

`User.companyId` references `Company`. `Project.companyId` is required and references `Company`; projects contain request requirements, lifecycle status, progress, team references, milestones, grouped technologies, updates, and activity. Client project reads always filter by the authenticated user's company id.

## Connection behavior

The server logs a safe connection message and starts the HTTP server after attempting MongoDB connection. Enquiry, project, and admin data operations return `503` when the database is unavailable.
