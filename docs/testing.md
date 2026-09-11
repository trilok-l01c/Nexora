# Testing

## Static checks

```bash
npm --prefix server test
npm --prefix client run lint
npm --prefix client run build
```

The server test suite includes request-level checks for health, required fields, invalid email, unsupported attachments, unavailable database handling, protected routes, logout, and malformed JSON. These API tests do not require a running MongoDB instance.

## Manual API checks

Start the backend first:

```bash
npm --prefix server start
```

Check health:

```bash
curl http://localhost:4292/api/health
```

Test a contact submission:

```bash
curl -X POST http://localhost:4292/api/contact \
  -F 'name=Test User' \
  -F 'email=test@example.com' \
  -F 'service=Software development' \
  -F 'message=Test request' \
  -F 'attachments=@project-brief.pdf'
```

Test admin login with a cookie jar:

```bash
curl -c cookies.txt -b cookies.txt -X POST http://localhost:4292/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Then test protected lead access, status updates, and logout using the same cookie jar.

## Cases to verify

- Missing name, email, service, or message
- Invalid email
- Oversized input
- Malformed JSON
- Invalid credentials
- Missing authentication
- Invalid lead ID
- Invalid status and invalid status transition
- Logout followed by a protected request
- CORS from the configured frontend origin
