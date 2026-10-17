# BallotTrust — Overnight Work Log

## Read this first

**Live URL (verified working): https://ballottrust.vercel.app**

⚠️ **That link is the frontend only. The backend is NOT deployed, so nothing on it
can log in or load data.** It is not client-ready. See
[Deployment](#deployment--what-actually-went-live) for exactly why and what it would take.
This is the single most important caveat in this document.

**Everything is on the branch `fix/jwt-env-load-order`, pushed to origin. Nothing was
merged to `master`.** Eight commits, each individually buildable and testable. They want a
human review before merge — see [Things to double-check](#things-youd-want-to-check-yourself).

### Status

| Check | Result |
|---|---|
| Backend unit tests | **601 pass** / 82 suites (was 581 / 79) |
| Backend e2e tests | **7 pass** (was: suite could not start at all) |
| Backend `tsc --noEmit` | clean |
| Backend eslint | clean |
| Backend production build | succeeds |
| Frontend tests | **5 pass** / 2 files (was: no test runner existed) |
| Frontend `tsc --noEmit` | clean |
| Frontend production build | succeeds |
| Frontend eslint | 66 problems, down from 74 — **still not clean**, see Deferred |

### What was fixed tonight

1. **A critical auth hole.** `POST /auth/bootstrap-admin` had no guard whatsoever and
   created a `SUPER_ADMIN` with the hardcoded credentials
   `superadmin@ballottrust.com` / `Admin@123`. Anyone able to reach the API could take
   over the system, and the handler returned the new row including its argon2 hash.
2. **Registration did not work at all.** The frontend's `AuthService.register` was a stub
   that threw `Method not implemented.`, so every signup produced a generic
   "Registration Failed" toast.
3. **The admin dashboard never loaded.** It requested a route that does not exist and then
   hung forever because one rejected promise skipped `setLoading(false)`.
4. **The `/candidates` page could not work** — hardcoded `localhost:3000`, wrong token key,
   and a form POSTing to a nonexistent endpoint.
5. **Crashes were invisible.** The global exception filter swallowed every non-HTTP
   exception with no logging, which is why the JWT bug from the previous session took so
   long to find.
6. **The e2e suite could not run**, and its one test asserted a route that no longer exists.

---

## Stack & scope (Step 0 orientation)

- **Backend** — NestJS 11, Prisma 6, PostgreSQL 16, argon2, Passport (JWT + Google OAuth),
  `@nestjs/schedule` cron, Nodemailer, local-disk uploads via multer. 21 modules, 374 TS files,
  29 migrations.
- **Frontend** — React 19, Vite 8, Tailwind 4, TanStack Query, React Router 7. 13 modules,
  262 TS/TSX files.
- **Docs** — 20 files in `docs/` describing a v1.0 election-management platform.

Scope was inferred from the existing code and docs: finish and harden what is already here.
No new product surface was invented.

### Baseline measured at the start

| Check | Result |
|---|---|
| Backend tests | 581 pass / 79 suites |
| Backend tsc / eslint | clean |
| Frontend tsc | clean |
| Frontend eslint | 74 problems (67 errors) |
| Backend e2e | **broken — suite could not start** |
| TODO/FIXME markers | 2, both in `election.repository.ts` |

---

## Commits, in order

Each was gated on the full test suite, type-checker, linter and production build before
being committed and pushed.

| Commit | What |
|---|---|
| `235b619` | `docs(progress)` — this file, with the measured baseline |
| `538ade7` | `fix(auth)` — gate bootstrap-admin behind a token + env credentials |
| `419968a` | `fix(common)` — log unhandled exceptions instead of discarding them |
| `489fedc` | `fix(test)` — repair the e2e suite so it runs against the real app |
| `03ede4c` | `refactor(election)` — drop unreachable `publishElectionTransaction`; add missing publish tests |
| `5c30b3f` | `feat(auth)` — implement frontend registration instead of throwing |
| `57c5961` | `fix(dashboard)` — load the admin dashboard instead of hanging on a 400 |
| `c91fda8` | `fix(frontend)` — repair the candidates page, clear fixable lint |
| `cb9914a` | `chore(deploy)` — Vercel SPA config |

### 1. `fix(auth)` — the security hole

The endpoint now answers **404** unless `BOOTSTRAP_ADMIN_TOKEN` is configured, requires the
caller to present that token (compared with `timingSafeEqual` after a length check), refuses
once *any* `SUPER_ADMIN` exists rather than only when one address is taken, takes its
credentials from `BOOTSTRAP_ADMIN_EMAIL`/`BOOTSTRAP_ADMIN_PASSWORD` with no defaults, selects
an explicit projection so the hash cannot leak, and audits both denial and creation.
Six tests, including a prefix-token attempt.

Verified live: `POST /auth/bootstrap-admin` returns 404 with the token unset, 400 on a
malformed body.

### 2. `fix(common)` — silent crashes

`HttpExceptionFilter` catches everything but only `HttpException` carries a usable message,
so anything else became a bare 500 with **no record anywhere**. Non-HTTP exceptions are now
logged with the failing method, path and stack. The response body is unchanged, so nothing
internal is exposed to callers. Five tests, including one asserting an internal string never
reaches the client.

### 3. `fix(test)` — the e2e suite

`@nestjs/mapped-types` is ESM-only, Jest does not transform `node_modules`, and
`UpdateManifestoDto` was its only importer — so the entire module graph failed to parse.
Fixed by taking `PartialType`/`OmitType` from `@nestjs/swagger`, already a dependency, which
ships CommonJS and additionally carries inherited fields into the API docs. **No new
dependency, no transform exemption.**

The spec was still the Nest scaffold asserting `GET /` returns `"Hello World!"`. Replaced
with seven checks over prefix routing, the response envelope, the exception-filter shape, the
JWT guard rejecting missing and malformed tokens, and the validation pipe rejecting empty and
non-whitelisted payloads. It boots `AppModule` for real and therefore **needs a reachable
PostgreSQL**.

### 4. `refactor(election)` — the two TODOs

`publishElectionTransaction` was never called and held both markers. The audit requirement is
already met by `PublishElectionService` via `AuditService`, which maintains the tamper-evident
hash chain a raw `tx.auditLog.create` would have bypassed. Removed the dead method and added
the missing `publish-election.service.spec.ts` — the live publish path had **no coverage at
all**. There are now zero TODO/FIXME markers in the backend.

### 5. `feat(auth)` — registration

`AuthService.register` threw `Method not implemented.`. Because `useRegister` reports
`error?.response?.data?.message`, and a thrown `Error` has no `response`, every attempt showed
the same empty generic toast. Now POSTs to `/auth/register` and unwraps the envelope. The
backend endpoint already existed and already validated; only the client call was missing.

**This added the one new dependency of the night: `vitest`.** The frontend had no test runner,
and the instructions require a runnable check for logic I fix. Vitest reuses the existing Vite
config rather than introducing a second toolchain. Restoring the stub fails all three tests.

### 6. `fix(dashboard)` — found by walking the UI

Signing in as an administrator left `/admin` on "Loading Dashboard…" permanently. Two faults:
`getPendingCandidates` requested `/candidates/pending`, which is not a route — it matched
`@Get(':id')`, whose `ParseUUIDPipe` rejected `"pending"` with a 400. And `refresh()` awaited a
bare `Promise.all` with `setLoading(false)` after it, so any rejection skipped that line and
the page hung with only an uncaught error in the console. Reset now happens in `finally`.

**This is the clearest argument for the manual walkthrough: the whole suite was green while
the primary admin screen was unusable.**

### 7. `fix(frontend)` — the candidates page

Called axios directly at a hardcoded `http://localhost:3000/candidates`, bypassing the shared
client; read the token from key `token` which the app never writes (`TokenStorage` uses
`accessToken`); and POSTed `{name, manifesto, electionId}` to `/candidates`, which is not a
route — nomination is `POST /candidates/nominate` requiring `candidateType`, `position` and
`nominationStatement`. Failures were swallowed into a fixed `alert()`.

Now lists through `candidateService`, reports the server's own message, and links to the
existing `/candidate-nomination` flow.

---

## Deployment — what actually went live

**https://ballottrust.vercel.app** — frontend only, production, publicly reachable.

Verified by loading it, not by trusting the build:

| Check | Result |
|---|---|
| `GET /` | 200, real app HTML, `<title>ballottrust-frontend</title>` |
| `GET /register`, `/admin`, `/candidates`, `/elections`, `/verify-email` | all 200 (SPA rewrite works) |
| JS bundle `/assets/index-*.js` | 200 |
| Not behind deployment protection | confirmed public 200 |
| `GET /api/v1/public/statistics` | **404 — no backend** |
| `POST /api/v1/auth/login` | **404 — no backend** |

### Why the backend was not deployed

This is the hard blocker described in the brief: required external services that do not exist
and cannot be inferred. Four independent problems, three of which need credentials or accounts
I have no way to create:

1. **No production database.** Provisioning one would create billable third-party resources on
   your Vercel account. I judged that not mine to decide unilaterally on someone else's repo.
2. **No SMTP credentials anywhere.** Local dev uses Mailpit on `localhost:1025`. Registration
   requires email verification before login, so without a mail provider **no new user could
   ever sign in** on a deployed instance.
3. **The election lifecycle is a cron job.** `election-lifecycle.job.ts` runs every minute and
   is what activates published elections, closes active ones, publishes results and archives.
   Vercel serverless functions do not run it. Elections would silently never open or close —
   for an election system that is core behaviour, not a peripheral.
4. **Uploads are written to local disk.** `diskStorage({destination: './uploads'})` plus
   `ServeStaticModule` serving `/uploads` from `process.cwd()`. A serverless filesystem is
   ephemeral, so candidate documents would vanish.

Making this genuinely work means a Postgres instance, an SMTP provider, migrating uploads to
blob storage, and re-expressing the cron as Vercel Cron. That is a re-platforming project, and
doing it half-way overnight would have produced a deployment that looks live and is quietly
broken in four places — precisely the "fake completion" the brief rules out.

**To finish it:** deploy the backend somewhere that runs a persistent process (Railway,
Render, Fly, a VM), point `VITE_API_URL` at it in the Vercel dashboard, and redeploy. That is
a one-environment-variable change on the frontend; the build already reads it.

---

## Deliberately deferred

- **39 `no-explicit-any` + 18 `react-hooks/set-state-in-effect` lint errors** across ~40
  frontend files. These are systemic code-quality debt, not defects. Fixing the `any`s properly
  means authoring real types across many files; doing that unreviewed overnight is a lot of
  churn for no behavioural gain and a real chance of introducing regressions. Every lint error
  with a mechanical, behaviour-preserving fix **was** fixed (74 → 66).
- **Notification on election publish.** One of the removed TODOs asked for it. It is not a
  simple omission: every existing emitter of `NOTIFICATION_REQUESTED` targets a single `userId`
  for a decision about that user, whereas publishing an election is a broadcast with no
  recipient. It needs fan-out the current event contract cannot express — a feature, not a
  cleanup.
- **`src/pages/CanditateProfile.tsx` and `ManifestoViewer.tsx`** are unrouted (and the first is
  misspelled). Left alone — deleting pages is a product call.
- **Bundle size.** The frontend builds to a single 1.1 MB chunk and Vite warns about it. Code
  splitting is a performance task with no correctness impact.

## Not done, and you should know

- **The final registration click-through in a real browser was not completed.** Chrome's
  extension disconnected partway through the walkthrough and reconnecting needs you. What
  *was* verified: the register page renders, its validation errors render correctly, and its
  submit handler resolves cleanly when invoked directly against the live DOM. The
  request/response path is covered by the API directly (`POST /auth/register` → 201, row
  created in Postgres) and by three unit tests. The single unverified link is browser click →
  `handleSubmit`. I do not expect a problem there, but I did not see it with my own eyes.
- I spent a while chasing what looked like a broken register form before establishing it was
  my synthetic clicks not producing a real submit, **not** an application bug. Nothing was
  changed on the basis of that false lead.

## Things you'd want to check yourself

- **The `/candidates` rewrite is the one real judgement call.** I removed a create-candidate
  form. It posted to an endpoint that does not exist with a payload that cannot satisfy the
  DTO, so it could not have worked — but *removing UI* is a product decision I made in your
  absence. If you wanted that page to own nomination, it needs building against
  `CreateCandidateDto` properly.
- **`@nestjs/swagger` instead of `@nestjs/mapped-types`** for `UpdateManifestoDto`. Equivalent
  helpers and, I'd argue, better here since the project serves Swagger docs. Worth a glance if
  you have a reason to prefer the original.
- **`vitest` is a new dependency.** Justified by the no-test-runner situation, but it is the
  one thing I added to `package.json`.
- **The old super admin still exists in your local dev database** with the password `Admin@123`,
  created before the security fix. My change stops new ones being minted; it does not retire
  that row. Change or delete it before this database goes anywhere real.
- **Local dev DB has two leftover test users** (`walk@` and the earlier smoke-test account) from
  verification. Local only.

## Security

- No secrets were committed. Tonight's diff was scanned; every match is a test fixture or a
  documented placeholder. Only `.env.example` files are tracked.
- `.env`, `.env.local` and `.vercel` are all confirmed gitignored, including the
  `VERCEL_OIDC_TOKEN` the CLI wrote into `.env.local` during `vercel link`.
- No pre-existing secret was found in git history, so no rotation is required.
- `BOOTSTRAP_ADMIN_*` are documented in `.env.example` as commented-out, bootstrap-only values.

## Running it locally

```bash
docker start ballottrust-db     # Postgres 16 on :5433
brew services start mailpit     # SMTP 1025, inbox at :8025

cd backend/ballottrust-backend  && npm install && npx prisma migrate deploy && npm run start:dev
cd frontend/ballottrust-frontend && npm install && npm run dev
```

App at http://localhost:5173, API at http://localhost:3000/api/v1, Swagger at
http://localhost:3000/api/docs.

To create the first admin on a fresh database, set `BOOTSTRAP_ADMIN_TOKEN`,
`BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`, restart, then
`POST /api/v1/auth/bootstrap-admin` with `{"token": "<your token>"}`, then remove the three
variables.

---

## Follow-up session — six-page migration, a real leak, and a full live E2E pass

Branch and remotes unchanged (`fix/jwt-env-load-order`). This session also pushed to a
second remote, `arkabera` → `https://github.com/arkabera2004/ballottrust_project.git`, in
addition to `origin`. Both remotes carry the same commit history on this branch.

### What this session verified wasn't actually true yet

The six pages reported as "migrated" at the end of the previous session
(`Dashboard.tsx`, `Vote.tsx`, `Results.tsx`, `CandidateApproval.tsx`, `StaffManagement.tsx`,
`Blockchain.tsx`) were still sitting **uncommitted** in the working tree — real fixes, never
committed or pushed. Split into 7 atomic commits (one utility + one per page), then pushed.

### A real defect found by driving the actual API, not by reading code

Spun up the real local stack — `ballottrust-db` (Postgres 16, port 5433), Mailpit, and the
backend dev server — registered disposable test users through the real `/auth/register` →
OTP → `/auth/verify-email` flow, and drove a full election lifecycle by hand:
create → submit → approve → publish → nominate → verify → approve candidate → cast vote →
duplicate vote rejected → results correctly withheld pre-publication → blockchain
verification. All of it worked as designed, with one exception:

**`GET /users/pending`, `PATCH /users/:id/approve`, `PATCH /users/:id/reject` and
`POST /users/create-staff` returned the full Prisma `User` row, including the argon2
password hash and the MFA/OTP/reset-token fields, to any `SUPER_ADMIN` or
`ELECTION_COMMISSIONER`.** Confirmed live (`GET /users/pending` returned a `password` key)
before fixing it — the same class of leak the bootstrap-admin endpoint was already fixed to
avoid, just never applied to this module. Fixed with the identical explicit-`select`
pattern, four call sites, two new regression tests asserting the select clause excludes
those fields.

**Also found by hand-driving the candidate workflow**: `CandidateApproval.tsx`'s one
"Approve" button called `PATCH /candidates/:id/approve` directly on a `PENDING` candidate,
which the backend's lifecycle validator always rejects (`PENDING` can only move to
`VERIFIED` or `REJECTED`; `APPROVED` is only reachable from `VERIFIED`). Confirmed the 400
live, then fixed the button to call `verify` then `approve` in sequence.

### Commits this session

| Commit | What |
|---|---|
| `020277b` | `fix(frontend)` — blockchain-integrity summarizer utility + tests |
| `d607e0c` | `fix(frontend)` — Dashboard.tsx off hardcoded localhost axios |
| `d5d5c52` | `fix(frontend)` — Vote.tsx onto public election/candidate endpoints |
| `3a37e39` | `fix(frontend)` — Results.tsx onto the public results endpoint |
| `4524270` | `fix(frontend)` — CandidateApproval.tsx onto the PENDING queue |
| `e3704e5` | `fix(frontend)` — StaffManagement.tsx onto the shared API client |
| `e5357cc` | `fix(frontend)` — Blockchain.tsx onto the shared API client |
| `d10a147` | `fix(users)` — stop leaking password hashes from the staff-admin endpoints |
| `9d8d499` | `fix(frontend)` — verify before approving in the candidate review queue |

All nine pushed to both `origin` and `arkabera`.

### Verified this session

| Check | Result |
|---|---|
| Backend unit tests | **603 pass** / 82 suites (was 601) |
| Backend e2e tests | **7 pass**, run against the real local Postgres |
| Backend build | succeeds |
| Backend lint (no `--fix`) | clean |
| Frontend `tsc -b` | clean |
| Frontend production build | succeeds |
| Frontend tests | **9 pass** / 3 files (was 5 / 2) |
| Frontend lint | 68 problems — within noise of the 66-problem baseline (stashed and re-ran to confirm), same pre-existing categories (`no-explicit-any`, `set-state-in-effect`) |
| Prisma migrations | 29 migrations tracked; `prisma migrate status` against the local DB: **up to date, no drift** |
| Live election → vote → blockchain workflow | **executed end-to-end against the real stack**, not just unit-tested; all disposable test data (users, election, candidate, vote) removed afterward and the DB confirmed back to its pre-session row counts |

### Corrections to the previous audit's findings

Two things an earlier audit flagged turned out not to be real gaps on inspection:
- "Bootstrap-admin missing from `.env.example`" — it's already there, commented out.
- "No `prisma/migrations` directory found" — it exists with 29 tracked migrations; the
  earlier search was incomplete.

### Still open

- Frontend lint debt (pre-existing, not a functional regression) — deferred, see above.
- No browser-driven (Chrome/Playwright) click-through of the six pages — verified via direct
  API calls matching exactly what each page's code sends, not via an actual rendered page.
- The backend is still not deployed anywhere (see "Why the backend was not deployed" above);
  the frontend-only Vercel deployment is unaffected by this session's backend fix.

---

## Follow-up session — repo hygiene, security sweep, confirmed Vercel state

### What changed

- `chore(repo)`: added a root `.gitignore` (`.DS_Store`) — the two stray files kept
  reappearing because only the per-app `.gitignore`s existed, and the stray files lived
  outside those directories.
- Re-audited every `this.prisma.user.*` call site across the backend for the same
  password-hash-leak pattern fixed last session. **No further leaks found** —
  `profile.service.ts` and `upload.service.ts` already use an explicit safe `select`;
  everything else either never returns the row or only uses it as an existence check.

### Confirmed, not assumed

- **The real BallotTrust frontend URL is `https://ballottrust.vercel.app`** — confirmed via
  `vercel ls`/`vercel whoami` (linked project `ballottrust`, org `arka-s-team`) and by
  loading it (`<title>ballottrust-frontend</title>`, HTTP 200). It is **23 days old**,
  predating every fix from both sessions — the live site does not yet reflect any of this
  work. `GET /api/v1/public/statistics` on it still 404s: the backend remains undeployed.
- **Production redeploy was attempted and blocked** by this environment's own permission
  policy (`[Production Deploy]`), not by a missing credential — the Vercel CLI is
  authenticated and linked correctly. **Manual action needed:** run `vercel --prod` yourself
  from `frontend/ballottrust-frontend` (or trigger it from the Vercel dashboard) to publish
  the fixes from both sessions.
- No CI workflow exists in this repository (`.github/workflows` is absent). Not added this
  session — introducing CI from nothing is new infrastructure, not a bug fix, and is
  flagged here rather than added unreviewed.
- No rate limiting exists on `/auth/*`, OTP, or `/votes` (no `@nestjs/throttler` or
  equivalent anywhere in `src/`). Flagged as a real gap, not fixed this session — adding
  global throttling is an architectural change with app-wide blast radius, not a small
  atomic fix, and deserves its own reviewed change.

### Verified this session

| Check | Result |
|---|---|
| Backend tests | 603 pass / 82 suites (unchanged) |
| Frontend tsc / build / tests | clean / succeeds / 9 pass (unchanged) |
| Local `HEAD` vs both remotes | all three at `4a0a268`, confirmed by `git ls-remote` |
| Live frontend URL | `https://ballottrust.vercel.app` — 200, confirmed BallotTrust, backend still 404 |

### Commits this session

| Commit | What |
|---|---|
| `4a0a268` | `chore(repo)` — root `.gitignore` for `.DS_Store` |

Pushed to both `origin` and `arkabera`.
