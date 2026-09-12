# Nexora Overview

Nexora is an IT solutions company website with a Next.js client and an Express/Mongoose backend.

## Product flow

```text
Public website -> Sign in/sign up -> Client company -> Client dashboard
Client -> Add project -> Pending Review -> Staff project operations
Client -> Project updates/team/technology -> Support ticket
```

## Applications

- `client/`: public website, authentication dialog, client portal, and admin interface.
- `server/`: REST API, MongoDB connection, enquiry/project storage, role-aware authentication, and security middleware.

## Principles

- Public signup creates only client accounts.
- Company contact details remain static frontend content.
- Projects are company-scoped and accessible only to authenticated company clients or authorized admins.
- MongoDB is the source of truth for enquiries, users, companies, projects, and support tickets.
