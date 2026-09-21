# Database

MongoDB is connected through Mongoose in `server/config/database.js`.

## Lead model

Stored in the `leads` collection:

- `name`: required string, max 100 characters
- `email`: required normalized string, max 254 characters
- `phone`: optional string, max 30 characters
- `company`: optional string, max 120 characters
- `service`: required string, max 120 characters
- `message`: required string, max 5000 characters (the requirement/enquiry text)
- `source`: `website`, `manual`, `referral`, or `other` (default `website`)
- `status`: `new`, `contacted`, `in_progress`, `completed`, `rejected` (default `new`, indexed)
- `notes`: embedded relationship timeline entries `{ text, type: note|status|converted, author, authorName, createdAt }`
- `convertedCompanyId`, `convertedUserId`, `convertedAt`: set only by the admin conversion workflow
- `createdAt` and `updatedAt`: automatic timestamps

Public enquiries create leads with `source: "website"` and `status: "new"`. Leads become client accounts only through the explicit conversion endpoint, which reuses the Company matching rules from client signup. Legacy `contacts` (the previous lead inbox) and `enquiries` documents can be copied into leads with the non-destructive `node scripts/migrateLegacyLeads.js` migration, which never deletes the old collections; legacy `completed` rows migrate as `in_progress` with the original status kept on the timeline.

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

The server logs a safe connection message and starts the HTTP server after attempting MongoDB connection. Lead, project, and admin data operations return `503` when the database is unavailable.
