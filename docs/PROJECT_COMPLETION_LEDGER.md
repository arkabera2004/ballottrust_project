# BallotTrust — Project Completion Ledger

Structured task-tracking ledger for autonomous completion work. `PROGRESS.md` (root) is the
historical narrative log of prior sessions — this file is the live status tracker. Read both
before resuming work.

## Baseline (2026-10-22)

- Repo: `/Users/arkabera/Desktop/ballottrust-clean`, branch `fix/jwt-env-load-order`.
- Remotes `origin` and `arkabera` in lockstep at every commit so far.
- Backend: NestJS 11, Prisma 6.19/Postgres, argon2, JWT, passport-google-oauth20. 82 suites /
  603 tests passing, build+lint clean.
- Frontend: React 19, Vite 8, TS ~6.0. 9 tests passing, build clean, lint: 70 problems
  (62 errors, mostly `no-explicit-any`; 2 `react-hooks` errors in `Vote.tsx:80,84`).
- Vote integrity = DB-backed SHA-256 hash chain (NOT a distributed blockchain).
- No rate limiting, no refresh-token rotation, no env-var validation schema, no E2E
  framework, no CI, never browser-tested, backend not publicly deployed (frontend is, on
  Vercel, but points at nothing live).
- Full audit detail: see conversation history / `PROGRESS.md`.

## Task Log

| ID | Task | Status | Commit(s) | Evidence |
|---|---|---|---|---|
| BT-REPO-001 | Ignore local `.env*`, keep `.env.example` trackable | VERIFIED | `6980a69` | pushed to both remotes, SHAs confirmed equal |
| LEDGER-INIT | Create this ledger | VERIFIED | `81c116a` | pushed to both remotes |
| BT-SEC-001 | Rate limit auth/OTP endpoints | VERIFIED | `f912c77` (impl), `7193eab` (test) | `@nestjs/throttler` global 100/min + per-endpoint limits on register(5)/login(5)/verify-email(10)/resend-otp(3)/bootstrap-admin(3)/forgot-password(3)/reset-password(5); 83 suites/610 tests pass, build clean, lint clean; both remotes at `7193eab` |
| BT-SEC-002 | Refresh-token rotation on use | IN PROGRESS | — | — |
| BT-SEC-003 | Env-var validation schema | NOT STARTED | — | — |

**Known limitation (BT-SEC-001):** the throttler's default IP tracker reads `req.ip`
directly; if the app is ever deployed behind a reverse proxy/load balancer without Express
`trust proxy` configured, all traffic could appear to share one IP and the limit would be
too aggressive (or, if trust proxy is misconfigured to trust client-supplied headers, an
attacker could spoof `X-Forwarded-For` to bypass the limit entirely). Not fixed here —
no proxy topology was confirmed during this session. Revisit when BT-DEPLOY-001 establishes
the actual hosting setup.

Remaining backlog items (BT-TEST-001/2/3, BT-FE-001/2, BT-DEPLOY-001/2, BT-CI-001,
BT-DOCS-001) are carried over from the audit; see conversation history for descriptions.
They will be added to this table as they're started.

## Session continuity note

If resuming: re-run `git log --oneline -5` and `git status --short` first, then check this
table for the first `NOT STARTED`/`IN PROGRESS` row. Do not re-audit from scratch unless the
repo has materially changed since `6980a69`.
