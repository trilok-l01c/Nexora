# Database

MongoDB is connected through Mongoose in `server/config/database.js`.

## Contact model

Stored fields:

- `name`: required string, max 100 characters
- `email`: required normalized string, max 254 characters
- `phone`: optional string, max 30 characters
- `company`: optional string, max 120 characters
- `service`: required string, max 120 characters
- `message`: required string, max 5000 characters
- `attachments`: optional array of private file metadata and internal storage fields
- `status`: enum with default `new`
- `createdAt` and `updatedAt`: automatic timestamps

Allowed statuses:

```text
new | contacted | in_progress | completed | rejected
```

## User model

Stored fields:

- `email`: unique normalized admin email
- `passwordHash`: bcrypt hash, excluded from normal queries
- `role`: currently `admin`
- `active`: account switch
- `createdAt` and `updatedAt`

## Connection behavior

The server logs a safe connection message and starts the HTTP server after attempting MongoDB connection. Contact and admin data operations return `503` when the database is unavailable.

Attachment binaries are stored in the configured private `UPLOAD_DIR`; MongoDB stores their metadata and the admin download endpoint verifies the lead and attachment before sending a file.
