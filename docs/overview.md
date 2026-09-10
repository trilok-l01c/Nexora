# Nexora Overview

Nexora is an IT solutions company website with a Next.js client and an Express/Mongoose backend.

## Product flow

```text
Visitor -> Contact form -> POST /api/contact -> Validate -> MongoDB
Admin -> /admin -> Login -> Protected lead inbox -> Update status
```

## Applications

- `client/`: public website, service pages, contact form, and private admin interface.
- `server/`: REST API, MongoDB connection, lead storage, admin authentication, and security middleware.

## Principles

- No public user registration or public authentication.
- Company contact details remain static frontend content.
- Leads are private and accessible only to authenticated admins.
- MongoDB is the source of truth for contacts and admin users.
