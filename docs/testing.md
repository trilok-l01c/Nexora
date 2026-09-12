# Testing

## Static checks

```bash
npm --prefix server test
npm --prefix client run lint
npm --prefix client run build
```

The server test suite includes request-level checks for health, enquiry validation, unavailable database handling, removed lead-route protection, protected project routes, signup validation, logout, and malformed JSON. These API tests do not require a running MongoDB instance.

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
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","company":"Example","service":"Software development","message":"Test request"}'
```

Test admin login with a cookie jar:

```bash
curl -c cookies.txt -b cookies.txt -X POST http://localhost:4292/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Then test protected project access, project updates, and logout using the same cookie jar.

## Cases to verify

- Missing name, email, or message
- Invalid email
- Oversized input
- Malformed JSON
- Invalid credentials
- Missing authentication
- Invalid project ID
- Cross-company project access rejection
- Client project creation ignores a supplied company id
- Logout followed by a protected request
- CORS from the configured frontend origin
