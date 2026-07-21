# Jose JWT Authentication

This document defines the boundary between the application and the JWT-based admin authentication system using the `jose` library.

---

## Purpose

`jose` provides JWT signing, verification, and session management for the admin panel. It enables password-based login with HTTP-only cookie sessions.

---

## Ownership Boundary

Application owns:

- Password verification logic (`passwordMatches()`)
- JWT creation (`createSessionToken()`)
- JWT verification (`verifySessionToken()`)
- Session cookie management
- Admin guard (`requireAdmin()`)
- Login/logout Server Actions
- Middleware redirect logic

External system owns:

- JWT cryptographic operations (jose library)
- Cookie storage (browser)

Do not duplicate ownership across both sides.

---

## Configuration

Environment values:

```text
ADMIN_PASSWORD     — Admin login password (plain text, compared via timing-safe equal)
ADMIN_SESSION_SECRET — JWT signing secret (minimum 32 characters)
```

Source:

`.env` file (development) or environment variables (production)

Never document actual secret values.

---

## Runtime Flow

### Login

```text
Admin enters password on /admin/login
→ Server Action login(password) called
→ passwordMatches(candidate, expected) using timingSafeEqual
→ createSessionToken() signs JWT with HS256
→ JWT stored in HTTP-only cookie (ADMIN_COOKIE)
→ Redirect to /admin/
```

### Protected Request

```text
Request to /admin/* (not /admin/login)
→ Middleware (src/proxy.ts) reads cookie
→ verifySessionToken(token) verifies JWT
→ Valid → NextResponse.next()
→ Invalid → Redirect to /admin/login
```

### Server Action Guard

```text
Admin Server Action called
→ requireAdmin() reads cookie
→ verifySessionToken(token)
→ Valid → proceed with mutation
→ Invalid → redirect("/admin/login")
```

---

## Request Contract

Inputs:

- `password: string` — candidate password for login
- `token: string` — JWT from cookie for verification

---

## Response Contract

Success:

- Login: `{ success: true }`
- Verify: `true` (boolean)
- Create: JWT string

Failure:

- Login: `{ error: "Invalid password" }` or `{ error: "Admin authentication is not configured." }`
- Verify: `false`

Retry:

No automatic retry. Failed auth redirects to login.

---

## JWT Structure

```json
{
  "role": "admin",
  "sub": "portfolio-admin",
  "iat": 1234567890,
  "exp": 1235172690
}
```

- Algorithm: HS256
- Subject: "portfolio-admin"
- Expiry: 7 days (604800 seconds)
- Issued at: current timestamp

---

## Cookie Configuration

```typescript
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 604800, // 7 days
  path: "/",
};
```

- Name: `admin_session`
- HTTP-only: Yes (not accessible via JavaScript)
- Secure: Yes in production (HTTPS only)
- SameSite: Lax
- Path: `/` (available on all routes)

---

## Security Boundary

Application may know:

- Cookie name and options
- JWT payload structure
- Password comparison logic

Application must not know:

- Actual password value (timing-safe comparison prevents timing attacks)
- JWT secret value

Server/backend owns:

- Password storage (env var)
- JWT signing secret (env var)
- Session lifecycle

---

## Testing

Local:

- Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env`
- Login via `/admin/login`
- Verify cookie is set via browser dev tools

Production smoke test:

- Attempt login with correct password
- Verify redirect to `/admin/`
- Verify protected routes accessible

---

## Known Limitations

- Single admin model — no role system
- No rate limiting on login attempts
- No CSRF protection beyond SameSite cookie
- No session revocation (cookie valid until expiry)
- No refresh token rotation
- Password stored as plain text in env var

---

## Update Rules

Update when:

- JWT payload structure changes
- Cookie configuration changes
- Auth flow changes
- Security model changes
- Password handling changes
