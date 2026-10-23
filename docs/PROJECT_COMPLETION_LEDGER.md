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
| BT-SEC-002 | Refresh-token rotation on use | VERIFIED | `7243c2a` (impl, backend+frontend contract), `5bc0597` (test) | old token revoked + new one issued on every `/auth/refresh`; frontend stores rotated token; 83 suites/613 backend tests + 9 frontend tests pass; both remotes at `5bc0597` |
| BT-SEC-003 | Env-var validation schema | VERIFIED | `2e2623d` (impl), `7d3855b` (test) | `src/env.validation.ts` zod schema wired into `ConfigModule.forRoot({validate})`; requires DATABASE_URL, JWT_SECRET, GOOGLE_*, MAIL_HOST/PORT/FROM, leaves PORT/NODE_ENV/FRONTEND_URL/CORS_ORIGINS/BOOTSTRAP_* optional; 84 suites/626 backend tests pass, build+lint clean; live-boot smoke test skipped (needs a reachable Postgres, out of this session's scope) |
| BT-SEC-004 | Security headers (helmet) + configurable trust-proxy handling | VERIFIED | `520f26c` (impl), `69e2ddc` (test), `92d152e` (docs) | `main.ts` now calls `helmet()` (CSP relaxed only for the non-production Swagger UI) and sets Express `trust proxy` from a new optional `TRUST_PROXY` env var (defaults to `false`/trust-nobody, since hosting topology is still undecided). e2e test asserts real `X-Content-Type-Options`/`X-Frame-Options` headers and absence of `X-Powered-By` against a disposable local Postgres (`ballottrust` DB on port 5432) — not mocked. 84 suites/627 backend unit tests pass, 8/8 e2e tests pass, build+lint clean; both remotes verified at `92d152e` |

**Known limitation (BT-SEC-001), now partially addressed by BT-SEC-004:** `trust proxy` is
explicit and defaults safely to `false`, closing the "misconfigured to trust everything"
half of the original risk. The other half remains open: whoever deploys the app (BT-DEPLOY-001)
must set `TRUST_PROXY` to the correct hop count for the real topology, or the rate limiter
will again see one shared IP for all traffic. Revisit when BT-DEPLOY-001 establishes the
actual hosting setup.

Remaining backlog items (BT-TEST-001/2/3, BT-FE-001/2, BT-DEPLOY-001/2, BT-CI-001,
BT-DOCS-001) are described with acceptance criteria in the "Expanded backlog" section below.

| BT-TEST-001 | Backend e2e coverage: auth lifecycle + election governance workflow | PARTIAL | `0d92f97` (auth), `028c592` (election) | A disposable local Postgres (`ballottrust` DB on `localhost:5432`, already migrated) was confirmed reachable and used for real (non-mocked) e2e runs. `test/auth.e2e-spec.ts`: register→reject-pending→verify OTP→reject-unapproved→approve→login→guarded route→refresh rotation+reuse rejection→logout (9 tests). `test/election.e2e-spec.ts`: DRAFT→PENDING_APPROVAL→APPROVED→PUBLISHED plus role enforcement (only commissioner/admin can create, only SUPER_ADMIN can approve) and workflow-order guards (9 tests). 3 e2e suites / 26 tests pass total, backend unit suite still 84/627, lint+build clean; both remotes verified at `028c592`. **Remaining scope (tracked as BT-TEST-001b, not started):** candidate nomination→approval→ballot finalization, voter eligibility, vote casting, duplicate-vote rejection, election closure, and results retrieval — this needs the ballot-readiness and eligibility-engine machinery wired up and is a larger, separate increment. |
| BT-TEST-002 | Vote-integrity hash-chain guarantees verified against real data | VERIFIED | `df64f95` | New `test/vote-integrity.e2e-spec.ts` runs against the real disposable Postgres (direct Prisma setup for election/candidate/voters, bypassing the nomination pipeline, which BT-TEST-001b will cover): (1) two concurrent `VoteService.castVote` calls for the same voter resolve to exactly one success and one rejection, confirmed by `vote` row count; (2) the chain extends and `BlockchainService.verifyChain` reports valid across multiple votes; (3) directly mutating a stored vote's `anonymousToken` (simulating DB tampering without recomputing the hash) is detected as a hash mismatch. File-level comment documents precisely what the mechanism guarantees (tamper detection against one database of record) and does not (no distributed consensus; an attacker who also recomputes every downstream hash would not be caught). 4 e2e suites / 29 tests pass, backend unit suite 84/627, lint+build clean; both remotes verified at `df64f95`. |
| BT-FE-002 | Frontend bundle size (1.1MB main chunk warning) | VERIFIED | `2cc8664` | Every route page except `Login` (the "/" landing route, deferring it has no benefit) now loads via `React.lazy()` behind one `<Suspense>` in `App.tsx`; the lazy `const`s live in a new `routes/lazy-pages.ts` rather than inline per route file, since inlining them triggered 31 new `react-refresh/only-export-components` lint errors. Main chunk: 1.1MB → 347kB, no more Vite size warning. Verified in a real browser (Chrome, via `vite preview`): `/` (Login, eager) and `/register` (lazy) both render correctly with no console errors. Build/typecheck/lint (same 24 pre-existing problems, 0 new)/all 17 tests pass; CI run `39925896665` green on both remotes at `2cc8664`. |
| BT-CI-001 | GitHub Actions CI for backend and frontend | VERIFIED | `558a30e` (workflow), `9666c93` (test-isolation fix), `9714ac7` (npm install fix), `d5dbd30` (mailpit) | `.github/workflows/ci.yml`: backend job (Postgres 16 + Mailpit service containers, `npm install`, `prisma migrate deploy`, lint, build, unit tests, e2e tests) and frontend job (`npm ci`, lint — `continue-on-error` for the documented BT-FE-001b debt, tests, build). **Actually verified on hosted GitHub Actions** (not just locally): run `39924873921` on `fix/jwt-env-load-order` — both jobs green. Getting there surfaced two real, independent bugs: (1) `npm ci` failed nondeterministically on the backend with "Missing: <optional transitive dep> from lock file" — a known npm/lockfileVersion-3 optional-dependency bug, confirmed not a real drift (switched to `npm install`, which still fails on an unsatisfiable range); (2) `jwt.strategy.spec.ts`'s "fails fast with no secret" test was silently relying on `process.env.JWT_SECRET` being absent, which broke once `@prisma/client`'s generated runtime (loaded via the spec's real `Role` enum import) triggered its documented `.env`-on-import side effect, populating the real dev secret — fixed by explicitly clearing/restoring the var in that one test. The e2e job also needed a real Mailpit container (matching local dev's `.env.example`) since registration legitimately fails loudly, by design, when SMTP is unreachable. |
| BT-TEST-003 | Frontend test coverage beyond 3 files / 9 tests | VERIFIED | `8971e38` (infra), `3e592b6` (LoginForm bug+tests), `214959c` (RoleRoute) | Added `@testing-library/react`/`jest-dom`/`user-event` + `jsdom` as dev deps, configured vitest `environment: 'jsdom'` with a setup file (`src/test/setup.ts`) for jest-dom matchers + auto-cleanup between tests. **Real bug found and fixed:** the "Continue with Google" button on `LoginForm` had no explicit `type`, so inside the surrounding `<form>` it defaulted to `type="submit"` — clicking it submitted the login form instead of redirecting to Google OAuth; a test that fills valid fields first (so validation alone can't explain the lack of a login call) caught this. Added `useLogin` hook tests (role-based redirect on success, rejected-credentials toast, unverified-email redirect) and `RoleRoute` protected-route tests (unauthenticated → redirect, wrong role → redirect, allowed role → renders). Frontend test count: 3 files/9 tests → **6 files/17 tests**, all passing; build+lint+typecheck unaffected. |
| BT-FE-001 | Frontend lint: React Hooks violations + `no-explicit-any` | PARTIAL | `6b3f498`, `6cc0413` | **Real bug fixed:** `AuthContext` restored the session via a `useEffect` after mount, so every page load briefly rendered as logged-out before flipping over; now reads `TokenStorage.getUser()` (a synchronous localStorage read) as the initial `useState` value directly, eliminating the effect and the flash entirely. **Exhaustive-deps fixed properly** (all 5 warnings, 0 remaining) in `Vote.tsx`, `useElection.ts`, `useElections.ts`, `OAuthCallback.tsx`. **All 41 `no-explicit-any` errors eliminated** (`6cc0413`): added a shared `getErrorMessage(error, fallback)` helper in `utils/api-error.ts` replacing the repeated `catch (error: any) { error?.response?.data?.message || 'X failed' }` pattern across ~20 files with `catch (error: unknown)` + the helper, plus real interfaces for `Dashboard.tsx`/`Vote.tsx`/`Results.tsx`/`ResultsPieChart.tsx`'s API response shapes and `profile.service.ts`'s existing `ProfileFormData` type. Caught by the real build (`tsc -b`, stricter than `tsc --noEmit` alone — surfaced 4 shape mismatches my interfaces initially missed) and fixed before commit. Lint went from 70→**24** problems (62 errors/8 warnings → 21 errors/3 warnings); frontend build, typecheck, and all 9 tests still pass. **Remaining (21 errors/3 warnings, unchanged by design):** 19 `react-hooks/set-state-in-effect` errors and 2 `react-refresh/only-export-components`, plus 3 `react-hooks/incompatible-library` warnings from `react-hook-form`'s `watch()` API. `set-state-in-effect` flags the ordinary "fetch data in a mount effect" pattern used throughout ~15 hook files; eliminating it properly means migrating those hooks to the already-installed `@tanstack/react-query` — a real architectural change, not a one-line fix — tracked as **BT-FE-001b**, not started. |

| BT-SEC-005 | Patch dependency vulnerabilities (new, found while verifying BT-CI-001) | VERIFIED | `ad5161e` (backend), `009e516` (frontend) | Backend: 32 → 8 vulnerabilities via `npm audit fix` (no `--force`, `package.json` unchanged) — includes two **critical** advisories directly relevant to this session's BT-SEC-004 trust-proxy work: `proxy-addr`'s IP-spoofing-via-IPv4-mapped-IPv6 (Express's own trust-proxy IP resolution dependency) and `handlebars`' JS-injection-via-AST-type-confusion (used by the mailer's templates). Remaining 8 (nodemailer/mailparser/preview-email chain) need a breaking major bump (`--force`), left for a follow-up to verify mail-sending doesn't regress. Frontend: 14 → **0** vulnerabilities (Vite dev-server/launch-editor arbitrary-command-execution and cross-origin-script-execution, source-map-js DoS) — dev-tooling only, not the shipped bundle, but matters for contributor machines. Both verified with full local regression (84/84 + 29/29 backend, 17/17 frontend, all lint/build/typecheck clean) and a green hosted CI run (`39926749612`) on both remotes at `009e516`. |
| BT-DOCS-001 | Project-specific subrepo READMEs | VERIFIED | `0a694bd` | Both `backend/ballottrust-backend/README.md` and `frontend/ballottrust-frontend/README.md` were still generic NestJS/Vite scaffold text. Replaced with real local setup, required/optional env vars (backend table cross-references `src/env.validation.ts`), test/build/CI commands, and documented known debt (BT-FE-001b lint scope-out, the `npm ci` lockfile quirk from BT-CI-001). |

## Baseline re-confirmed (2026-10-23)

Repo unchanged since last ledger entry (`db878fb`, clean working tree, both remotes in
lockstep). Re-ran actual commands rather than trusting the prior claim:

- Backend: `npm run lint` clean, `npm run build` clean, `npm run test` → **84 suites / 626
  tests pass**. Matches ledger exactly — no drift.
- Frontend: `npm run build` succeeds (one chunk-size warning, >500kB main bundle —
  unaddressed, candidate for a future perf task), `npm run test` → **3 files / 9 tests
  pass**, `npm run lint` → **70 problems (62 errors, 8 warnings)**. Matches ledger exactly.
- Spot checks beyond the ledger: 22 Prisma models / 22 backend modules; only one e2e spec
  file (`test/app.e2e-spec.ts`, 126 lines) — e2e coverage is thin relative to module count.
  No `helmet` dependency and no `app.set('trust proxy', ...)` in `main.ts` — confirms the
  BT-SEC-001 known-limitation note is still live, and security headers are unmanaged.

No code was changed this session (audit-only, per explicit user instruction).

## Expanded backlog (prioritized per mega-prompt's ranking: security/integrity > core
function > auth > API/DB > tests > frontend > deployment > perf/docs)

| ID | Task | Priority | Why it matters / acceptance criteria |
|---|---|---|---|
| BT-SEC-004 | Add `helmet` + explicit `trust proxy` configuration in `main.ts` | High (security) | No security headers (HSTS, X-Content-Type-Options, etc.) currently set; `trust proxy` is unset so BT-SEC-001's rate limiter trusts `req.ip` directly, which is wrong behind any reverse proxy/load balancer (Vercel, Render, etc.) and must be set explicitly once hosting topology is known. Acceptance: headers present on a live response; rate limiter correctly identifies real client IP behind the chosen host's proxy. |
| BT-TEST-001 | Expand e2e coverage beyond the single 126-line `app.e2e-spec.ts` | High (core function) | Only one e2e spec exists for 22 modules. Add e2e specs for the full auth flow (register→verify→login→refresh→logout) and the full election lifecycle (create election→nominate candidate→approve→vote→close→tally) against a real (test) Postgres + app instance. Acceptance: new specs pass via `npm run test:e2e`. |
| BT-TEST-002 | Document/verify vote-integrity hash-chain guarantees with a dedicated test suite | High (core function/integrity) | `docs/privacy-architecture.md` and the mega-prompt both stress this must be described accurately (DB-backed SHA-256 chain, not a blockchain). Add tests asserting tamper detection (mutate a stored vote row, confirm chain verification fails) and correct behavior under concurrent vote submission (no duplicate-vote race). Acceptance: tests demonstrate both properties pass/fail as expected. |
| BT-TEST-003 | Raise frontend test coverage beyond 3 files / 9 tests | Medium (tests) | Core flows (login form, candidate nomination form, voting ballot submission) have no component tests. Acceptance: at least one test per critical form/flow covering success + validation-error paths. |
| BT-FE-001 | Fix the 62 ESLint errors (`no-explicit-any` majority) and 2 `react-hooks` violations (`Vote.tsx:80,84`, `CandidatesPage` effect) | Medium (frontend correctness) | `react-hooks/set-state-in-effect` and `exhaustive-deps` warnings indicate real stale-state/render-loop risk, not just style. Acceptance: `npm run lint` reports 0 errors; hook violations resolved by moving logic to proper effect deps or event handlers, not by suppression. |
| BT-FE-002 | Address frontend bundle size warning (1.1MB main chunk) | Low (perf) | Vite warns the main chunk exceeds 500kB after minification. Acceptance: route-level code-splitting (dynamic `import()` for heavy pages like dashboard/reports) brings main chunk under the warning threshold, verified by a clean `npm run build`. |
| BT-DEPLOY-001 | Deploy the backend to a reachable host with a real Postgres, and point the already-live frontend (`https://ballottrust.vercel.app`) at it | High (blocks real usage) | Per `PROGRESS.md`, the frontend is live but the backend is not — nothing on the live site can function. Needs a hosting decision (Render/Railway/Fly/etc.) and a managed Postgres instance; this is a credential/infra decision outside what this session can execute unilaterally. Acceptance: live frontend can register/login/vote end-to-end against the deployed backend. |
| BT-DEPLOY-002 | Configure production CORS/env vars to match the real deployed frontend origin | High (security, depends on BT-DEPLOY-001) | `CORS_ORIGINS` currently defaults to localhost. Acceptance: production `CORS_ORIGINS` is set to the exact Vercel origin only, verified by a live cross-origin request test. |
| BT-CI-001 | Add GitHub Actions CI (lint+test+build for both frontend and backend on PR/push) | Medium (process) | No `.github/workflows` exists anywhere in the repo — every check so far has been run manually. Acceptance: a workflow file runs backend+frontend lint/test/build and fails the check on any regression. |
| BT-DOCS-001 | Give each subrepo (`backend/ballottrust-backend/README.md`, `frontend/ballottrust-frontend/README.md`) a project-specific README | Low (docs) | Both currently contain generic framework boilerplate (NestJS/Vite default text), not setup instructions specific to this project. Acceptance: each README documents real local setup (env vars, DB, run/test commands) matching the root `docs/` set. |

## Recommended next task

BT-SEC-004 is now VERIFIED. **BT-TEST-001** (backend e2e coverage) is next: a disposable
local Postgres is confirmed reachable this session (`ballottrust` DB on `localhost:5432`,
already migrated), removing the "no database available" blocker that applied to earlier
sessions, so the auth and election-lifecycle e2e specs can actually be written and run now.

## Session continuity note

If resuming: re-run `git log --oneline -5` and `git status --short` first, then check this
table for the first `NOT STARTED`/`IN PROGRESS` row. Do not re-audit from scratch unless the
repo has materially changed since `db878fb` (baseline re-confirmed 2026-10-23).
