# AI Risk Investigation Demo

This repository is a fintech risk-investigation demo. It shows how suspicious payment or dispute cases can move from a real-time screening layer into an AI-assisted investigation workspace backed by durable operational data.

The demo story is intentionally not "LLM in the millisecond authorization path." Rules, ML, graph features, and risk scoring create or hold suspicious cases first. Agents then investigate those cases, assemble evidence, explain the decision, and write back auditable outcomes.

## Planning Docs

- [Motivation](docs/motivation.md)
- [Design](docs/design.md)
- [Task Breakdown](docs/task-breakdown.md)
- [New Frontend Data Contract](docs/frontend-data-contract.md)
- [Project Skills](docs/skills.md)

## What Runs Today

There are two runnable surfaces in the project.

### Current Visual Demo: Next.js CLAIMS Frontend

The refactored frontend is the main demo surface. It is a Next.js app with a polished CLAIMS-style case workspace. By default, its `/api/*` routes adapt the real TiDB-backed backend API on port `8787` into the frontend contract.

```bash
npx --yes pnpm@10.23.0 install --frozen-lockfile
npm run dev:api:tidb
npx --yes pnpm@10.23.0 --dir frontend dev --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000/
```

The root route redirects to the first TiDB-backed generated case, for example `RC00000697`. Browser mocks remain available for offline visual work with `NEXT_PUBLIC_USE_MSW=true`.

### Legacy API + TiDB Backend

The original Node API still supports local file mode and TiDB Zero mode. This is the current backend-storage implementation and is useful for the TiDB narrative.

```bash
npm install
npm run import:tidb
npm run dev:api:tidb
```

The API listens on:

```text
http://127.0.0.1:8787
```

Confirm the active backend:

```bash
curl http://127.0.0.1:8787/api/health
```

Expected TiDB-backed response includes:

```json
{ "repository": "tidb", "agentRuntime": "codex-cli" }
```

On another machine, configure TiDB with environment variables instead of the local wrapper:

```text
TIDB_DEMO_HOST
TIDB_DEMO_PORT
TIDB_DEMO_USER
TIDB_DEMO_PASSWORD
TIDB_DEMO_DATABASE
TIDB_DEMO_SSL_CA
```

Do not commit TiDB Cloud connection details.

To make the chat agents use the local Codex CLI as the real agent runtime, start the API with:

```text
RISK_AGENT_PROVIDER=codex
RISK_CODEX_BIN=/opt/homebrew/bin/codex
```

Optional:

```text
RISK_CODEX_MODEL=<codex model override>
RISK_AGENT_TIMEOUT_MS=25000
```

When configured, both the initial case investigation timeline and `POST /api/cases/:id/chat` send each agent task plus TiDB-backed tool observations to `codex exec` and return Codex's final agent response. If Codex CLI is unavailable or times out, each agent intentionally falls back to deterministic local skills so the demo still runs offline.

## Data Storage Today

The repository has three data modes:

1. The Next.js UI reads real case data through route handlers in `frontend/app/api/cases/*`, which call the `8787` backend API.
2. `data/seed.json` and `data/paysim-like/*.csv` drive the legacy local API mode.
3. TiDB Zero stores the same legacy case model in `riskops_ai_demo` for backend-storage demos.

`frontend/mocks/` is now an explicit fallback for offline demos and UI iteration, not the default runtime data source.

## Current Demo Flow

1. Open the CLAIMS frontend case workspace.
2. Select a suspicious dispute or payment case, for example `RC00000697`.
3. Review customer profile, transaction context, dispute signals, graph/evidence context, and agent activity.
4. Run or replay the investigation timeline.
5. Inspect agent findings and final synthesis.
6. Explain TiDB as the shared state layer for transactions, cases, evidence, relationships, memory, and agent writeback.

The visible workflow is:

```text
Realtime screening -> Case queue -> Agent investigation -> Evidence-bound decision -> Durable writeback
```

## Synthetic Data Strategy

The default guided data keeps the live demo stable.

For larger datasets, use the PaySim-style generator:

```bash
DEMO_TXN_COUNT=100000 npm run seed:paysim
```

This writes:

```text
data/paysim-like/transactions.csv
data/paysim-like/risk_cases.csv
data/paysim-like/network_edges.csv
data/paysim-like/memory_events.csv
```

The generator borrows PaySim's domain shape, not its GPL-licensed Java source. It produces transactions plus demo-specific case, evidence, relationship, and memory tables.

## TiDB Backend Story

TiDB is the backend state layer for:

- operational state: `transactions`, `customers`, `merchants`, `risk_cases`
- evidence and relationship state: `evidence_files`, `network_edges`
- agent memory and output: `memory_events`, `agent_findings`, `case_timeline_events`, `case_synthesis`

The legacy TiDB repository already imports and reads the core tables. The new frontend needs additional workflow/timeline fields and endpoints. See [docs/frontend-data-contract.md](docs/frontend-data-contract.md) for the proposed schema and API alignment.

## Validation

Useful commands:

```bash
npx --yes pnpm@10.23.0 --dir frontend build
curl http://127.0.0.1:8787/api/health
```

For the current machine, the new frontend can also run as a persistent local service at:

```text
http://127.0.0.1:3000/
```

## Project Skills

Reusable agent-facing operational skills live under `skills/`:

- `skills/risk-demo-data-generation/SKILL.md`: regenerate PaySim-style data, create more open cases, import into TiDB, and validate counts.
- `skills/risk-demo-agent-configuration/SKILL.md`: configure and verify real AI agent runtimes such as Codex CLI, plus the contract for future local CLI adapters.

## Next Integration Steps

1. Seed the Sarah Chen / `CASE-2461` story into TiDB if that exact guided scenario is needed in the real backend.
2. Persist richer execution writeback for `POST /api/cases/:id/execute` beyond the current resolved-status update.
3. Persist real chat agent outputs from `POST /api/cases/:id/chat` into TiDB.
