# BallotTrust Frontend

React 19 + Vite 8 + TypeScript SPA for BallotTrust, an election management
platform. TanStack Query, React Router 7, Tailwind 4, React Hook Form +
Zod. See `docs/` at the repo root for the full product/architecture docs.

## Prerequisites

- Node.js (recent LTS)
- The backend running locally (see `../../backend/ballottrust-backend/README.md`)
  — most of the app needs a real API to talk to

## Local setup

```bash
npm install
npm run dev   # starts Vite on http://localhost:5173
```

The dev server proxies `/api` and `/uploads` to the backend (see
`vite.config.ts`), so requests stay same-origin and no `.env` file is
required for a default local setup pointed at a backend on
`localhost:3000`.

## Environment variables

All optional — see `.env.example` for defaults and inline comments:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base path/URL; defaults to the relative `/api/v1` so the dev proxy handles it |
| `VITE_ASSET_URL` | Origin serving `/uploads`; derived from `VITE_API_URL` when unset |
| `VITE_API_PROXY_TARGET` | Dev-proxy target (build-time only, not exposed to client code); defaults to `http://localhost:3000` |

## Testing

```bash
npm run test   # vitest, jsdom environment, React Testing Library
```

Test setup lives in `src/test/setup.ts` (jest-dom matchers, auto-cleanup
between tests). Component tests render through `AuthProvider`/
`MemoryRouter` where the component under test needs auth state or
routing.

## Lint / build

```bash
npm run lint    # eslint --fix
npm run build   # tsc -b && vite build
```

**Known, documented lint debt** (see `docs/PROJECT_COMPLETION_LEDGER.md`,
BT-FE-001b): ~19 `react-hooks/set-state-in-effect` errors from the
project's manual fetch-in-effect hook pattern, used throughout many
hooks. Fixing these properly means migrating those hooks to the
already-installed `@tanstack/react-query` rather than a one-line
suppression; CI's frontend lint step is `continue-on-error` until that
migration lands.

## Routing and code-splitting

Routes are declared per-area in `src/routes/*.routes.tsx` and assembled
in `src/App.tsx`. Every page except the `/` login route is lazy-loaded
via `React.lazy()` behind a single `<Suspense>`; the lazy component
definitions live in `src/routes/lazy-pages.ts` (not inline in each route
file — see the comment there for why).

## CI

`.github/workflows/ci.yml` (repo root) runs lint (non-blocking, see
above), tests, and build on every push/PR.

## Troubleshooting

- **Pages load but every API call fails**: the backend isn't running, or
  `VITE_API_PROXY_TARGET` doesn't match where it's actually listening.
- **A protected page always redirects to `/`**: either no session is
  stored (login first) or the logged-in user's role isn't in that route's
  `allowedRoles` — see `src/routes/RoleRoute.tsx`.
