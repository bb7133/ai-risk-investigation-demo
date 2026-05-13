# Task Breakdown

## Phase 0: Project Skeleton

Status: done for starter version.

Deliverables:

- `~/Projects/ai-risk-investigation-demo`
- React + Vite web app
- Node.js local API
- fixed seed dataset
- PaySim-style generator
- Motivation / Design / Task Breakdown docs

Validation:

- `npm install`
- `npm run build`
- `npm run dev:api`
- `npm run dev:web`
- open `http://127.0.0.1:5177`

## Phase 1: Story-Ready Local Demo

Goal: make the demo story smooth before connecting real TiDB or real LLM calls.

Tasks:

1. Polish UI flow
   - case queue
   - case context
   - network graph
   - agent workspace
   - final risk dossier

2. Improve deterministic agent outputs
   - make findings more business-readable
   - show evidence links per finding
   - show confidence and reason codes
   - distinguish fact / inference / recommendation

3. Add demo script
   - 3-minute version
   - 8-minute version
   - failure/recovery talking points
   - explicit positioning: rules/ML handle real-time screening; agents handle investigation cases

4. Generate more realistic small seed
   - 3 P1 cases
   - 3 P2 cases
   - 5 normal cases
   - at least one case with strong memory evidence

Owner suggestion:

- Frontend/story: product/demo owner
- Data/agents: backend/agent owner

## Phase 2: Synthetic Data at Scale

Goal: make the TiDB scale story credible.

Tasks:

1. Extend PaySim-style generator
   - configurable client count
   - configurable merchant count
   - configurable fraud rate
   - configurable transaction count

2. Add TiDB import path
   - generate CSV
   - generate schema SQL
   - generate `LOAD DATA` script

3. Add summary metrics
   - total transactions
   - total fraud cases
   - top merchants by risk
   - top graph clusters

4. Add sampled evidence generation
   - device evidence
   - merchant payout evidence
   - customer history evidence
   - policy snippets

Validation:

- Generate 100k rows locally.
- Import to TiDB.
- API query latency stays acceptable for selected case lookup.

## Phase 3: TiDB Integration

Goal: replace local JSON/CSV store with TiDB.

Tasks:

1. Add DB connection config
   - `TIDB_HOST`
   - `TIDB_PORT`
   - `TIDB_USER`
   - `TIDB_PASSWORD`
   - `TIDB_DATABASE`

2. Add repository layer
   - `getCases()`
   - `getCaseBundle(caseId)`
   - `saveAgentFindings(caseId, findings)`
   - `saveMemoryEvent(event)`

3. Add schema migration
   - core tables
   - indexes
   - sample import

4. Add TiDB-backed demo mode
   - local JSON mode remains as fallback
   - TiDB mode selected by env var

Validation:

- Create tables in TiDB.
- Import generated data.
- Run demo against TiDB.
- Verify agent result writes back to TiDB.
- Verify case lookup remains fast enough for interactive investigation even when transaction table is large.

## Phase 4: Real Agent / LLM Integration

Goal: replace deterministic local logic with actual agent calls while preserving demo stability.

Tasks:

1. Define agent tool contracts
   - query customer history
   - query merchant risk
   - query network edges
   - query policy
   - recall memory
   - write finding

2. Add guarded LLM execution
   - deterministic fallback
   - timeout
   - token budget
   - trace log

3. Add evidence-bound output format
   - every finding must include evidence source
   - no unsupported conclusion
   - confidence score required
   - human-in-the-loop required for high-risk actions

4. Store outputs
   - `agent_findings`
   - `memory_events`
   - case action

Validation:

- Run same case 5 times.
- Results should be consistent enough for live demo.
- If LLM fails, fallback output still works.

## Phase 5: Demo Packaging

Goal: make the project easy to run for Korea testing / sales demo.

Tasks:

1. Add one-command startup
   - API + web launcher
   - optional TiDB seed command

2. Add environment examples
   - `.env.example`
   - local mode
   - TiDB mode

3. Add screenshots and demo guide
   - setup
   - talking points
   - known limitations

4. Add reset command
   - clean local generated data
   - re-seed TiDB demo database

Validation:

- Fresh machine setup in under 10 minutes.
- Demo can run without external LLM dependency.
- TiDB mode can be enabled when credentials are available.

## Risks

1. PaySim-style data may look too generic.
   - Mitigation: add demo-specific evidence and memory tables.

2. Real LLM calls may be unstable for live demo.
   - Mitigation: deterministic fallback and cached outputs.

3. Network graph can become visually noisy at scale.
   - Mitigation: show focused ego graph for selected case, not full graph.

4. TiDB setup may take time.
   - Mitigation: keep local JSON mode as baseline; connect TiDB in Phase 3.

## Immediate Next Tasks

1. Review these three docs.
2. Decide whether to keep fintech risk investigation as final direction.
3. Confirm whether demo should target local-only first or TiDB-backed first.
4. Confirm desired dataset size for first TiDB import: 100k, 1M, or 10M transactions.
5. Pick one P1 case story as the canonical live-demo path.
