# BallotTrust Backend

NestJS 11 API for BallotTrust, an election management platform. Prisma 6 /
PostgreSQL 16, argon2 password hashing, JWT access/refresh tokens, Google
OAuth, and a per-election SHA-256 vote hash chain (see
`docs/privacy-architecture.md` and `docs/eligibility-engine.md` at the repo
root — this is a database-backed tamper-detection chain, not a distributed
blockchain). See `docs/01_Project_Vision.md` onward at the repo root for
the full product/architecture docs.

## Prerequisites

- Node.js (see `package.json` engines, or just a recent LTS)
- A PostgreSQL 16 instance
- An SMTP server for OTP/notification emails in local dev — the project
  uses [Mailpit](https://github.com/axllent/mailpit) (`docker run -d -p
  1025:1025 -p 8025:8025 axllent/mailpit`), a disposable local inbox at
  `http://localhost:8025`

## Local setup

```bash
npm install
cp .env.example .env   # fill in the values below
npx prisma migrate deploy
npm run start:dev
```

The API is served under `/api/v1`; Swagger docs are at `/api/docs` in any
non-production environment (disabled in production — the schema
enumerates every route and role requirement).

## Environment variables

See `.env.example` for the full list and inline comments. The required
ones (startup fails fast and lists exactly what's missing/malformed if
any are wrong — see `src/env.validation.ts`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs access/refresh tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth sign-in |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_FROM` | SMTP server for OTP/notification emails |

Optional:

| Variable | Purpose |
|---|---|
| `PORT` | Defaults to `3000` |
| `NODE_ENV` | Gates Swagger and a few other dev-only behaviors |
| `FRONTEND_URL` | Base URL used to build links inside emails |
| `CORS_ORIGINS` | Comma-separated allowlist; defaults to the local dev servers only |
| `TRUST_PROXY` | Express `trust proxy` setting — leave unset locally (defaults to `false`); in production, set to the real reverse-proxy hop count once the hosting topology is known, never `"true"` |
| `MAIL_USER` / `MAIL_PASSWORD` | SMTP auth, if the mail server requires it |
| `BOOTSTRAP_ADMIN_TOKEN` / `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | One-time first-`SUPER_ADMIN` creation via `POST /auth/bootstrap-admin` — leave unset in normal operation; the endpoint 404s unless a token is configured |

## Database

Migrations live in `prisma/migrations/`. Apply them with:

```bash
npx prisma migrate deploy   # production-safe, applies pending migrations
npx prisma migrate dev      # local dev, also generates a new migration from schema changes
```

## Testing

```bash
npm run test       # unit tests (Jest)
npm run test:e2e   # end-to-end tests against the real module graph —
                    # needs a reachable PostgreSQL at DATABASE_URL and,
                    # for the auth e2e spec, a reachable SMTP server at
                    # MAIL_HOST:MAIL_PORT (Mailpit works)
npm run test:cov   # unit tests with coverage
```

## Lint / build

```bash
npm run lint    # eslint --fix
npm run build   # nest build
```

## CI

`.github/workflows/ci.yml` (repo root) runs lint, build, unit tests, and
e2e tests on every push/PR, against disposable Postgres and Mailpit
service containers.

## Troubleshooting

- **Startup throws "Invalid environment configuration"**: a required env
  var (see table above) is missing or malformed; the error message lists
  exactly which one(s).
- **`npm run test:e2e` fails with `ECONNREFUSED` on a mail-related call**:
  no SMTP server is reachable at `MAIL_HOST:MAIL_PORT` — start Mailpit (or
  point at a real SMTP server) before running e2e tests.
- **`npm ci` fails with "Missing: \<package\> from lock file"**: a known
  npm/lockfileVersion-3 quirk with optional transitive dependencies, not
  real drift — use `npm install` instead (this is what CI does).
