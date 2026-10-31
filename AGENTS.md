# Call Calendar

Booking service for calls. Contract-first: TypeSpec -> OpenAPI -> generated frontend SDK.

## Commands

All tooling versions are pinned in `mise.toml`; run everything through mise.

- `mise run install` — install all dependencies
- `mise run hooks` — install git hooks (pre-commit runs `mise run precommit`: lint + types)
- `mise run check` — lint + types + tests + build (what CI runs)
- `mise run test` — pytest only
- `mise run fix` — auto-fix lint and formatting
- `mise run generate` — rebuild OpenAPI and the frontend SDK after editing `api/main.tsp`
- `mise daemons start|stop|status|logs` — dev servers: backend :8000, frontend :5173

## Layout

- `api/` — TypeSpec contract (`main.tsp`), emits `api/dist/openapi.yaml`
- `backend/` — FastAPI (Python 3.13, uv). App in `backend/app`, tests in `backend/tests`
- `frontend/` — Vite + React + TypeScript + Mantine. `frontend/src/api` is generated, never edit it

## Rules

- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`, ...); the `commit-msg` hook enforces it.
- The API contract in `api/main.tsp` is the source of truth; change it first, then implement the backend to match.
- Do not edit or delete `.github/workflows/hexlet-check.yml`.
- Keep `mise run check` green before committing.
