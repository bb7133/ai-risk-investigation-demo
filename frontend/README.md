# CLAIMS Frontend

This is the refactored frontend for the AI risk investigation demo. It is a Next.js app that presents a CLAIMS-style case workspace for fraud, dispute, and risk-investigation workflows.

By default, the frontend uses Next.js route handlers under `app/api/` to read real case data from the repository's backend API on port `8787`. MSW browser handlers are still available as an explicit offline fallback.

## Run

From the repository root:

```bash
npx --yes pnpm@10.23.0 install --frozen-lockfile
npm run dev:api:tidb
npx --yes pnpm@10.23.0 --dir frontend dev --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000/
```

## Validation

```bash
npx --yes pnpm@10.23.0 --dir frontend build
```

The app should render the CLAIMS shell and TiDB-backed cases such as `RC00000697`.

## Data Mode

Default data source:

```text
frontend/app/api/cases/* -> http://127.0.0.1:8787/api/*
```

Important files:

- `frontend/lib/api/backend-adapter.ts` maps the backend API into the frontend contract.
- `frontend/app/api/cases/*` exposes same-origin routes for browser calls.
- `frontend/types/api.ts` is the frontend API contract.
- `frontend/mocks/` contains deterministic fallback data when `NEXT_PUBLIC_USE_MSW=true`.

MSW is useful for stable visual demos and frontend iteration, but it is not persistent storage and is no longer the default.

## Expected API Contract

The frontend expects these endpoints:

```text
GET  /api/cases
GET  /api/cases/:id
GET  /api/cases/:id/timeline
GET  /api/cases/:id/events
POST /api/cases
POST /api/cases/:id/execute
```

The TypeScript source of truth is `frontend/types/api.ts`.

High-level response model:

- `CaseListItem` for the queue.
- `Case` for case detail.
- `TimelineEntry[]` for agent work history.
- `CaseEvent` SSE events for live progress.
- resolved `Case` payload after execution.

## Backend Integration Plan

The project already has a backend API on port `8787` and a TiDB Zero repository. The frontend adapter keeps the visual contract stable while reading from that backend.

Recommended approach:

1. Keep the normalized TiDB tables as the source of truth.
2. Add timeline/workflow tables for the frontend's agent workspace.
3. Keep the adapter layer aligned with `frontend/types/api.ts`.
4. Keep MSW available as an offline fallback and demo fixture source.

See `../docs/frontend-data-contract.md` for the proposed TiDB schema additions and endpoint mapping.

## TiDB Demo Story

When wired to the backend, the frontend should show TiDB as the durable state layer for:

- case queue and customer/merchant/transaction facts
- evidence and graph relationships
- agent timeline, findings, synthesis, and recommended actions
- memory events that can be recalled in later investigations

This keeps the demo grounded in a realistic architecture: fast screening creates cases first, and agents investigate those cases with evidence-bound writeback.
