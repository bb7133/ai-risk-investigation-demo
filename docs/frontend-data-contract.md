# New Frontend Data Contract

This document describes how the refactored CLAIMS frontend should connect to the existing TiDB-backed demo backend.

## Current State

The repository currently has two working layers:

- `frontend/`: Next.js CLAIMS frontend. The default runtime path uses `frontend/app/api/cases/*` route handlers to read the real backend API; MSW is an explicit offline fallback.
- legacy API on `8787`: Node.js API with local-file and TiDB repository implementations.

They are connected through a Next.js API adapter. The browser keeps using the frontend contract in `frontend/types/api.ts`; the route handlers call the legacy API, map the TiDB-backed payloads, and return CLAIMS UI event shapes.

## Frontend Endpoints

The frontend expects this contract:

```text
GET  /api/cases
GET  /api/cases/:id
GET  /api/cases/:id/timeline
GET  /api/cases/:id/events
POST /api/cases
POST /api/cases/:id/chat
POST /api/cases/:id/execute
```

Recommended backend mapping:

| Endpoint | TiDB-backed behavior |
| --- | --- |
| `GET /api/cases` | Return queue rows from `risk_cases` joined with `transactions`, `customers`, and `merchants`. |
| `GET /api/cases/:id` | Return one case bundle with customer, merchant, transaction, evidence, graph, current synthesis, and available actions. |
| `GET /api/cases/:id/timeline` | Return ordered rows from `case_timeline_events`. |
| `GET /api/cases/:id/events` | Stream the same workflow stages as SSE. Initial version can replay persisted timeline rows with controlled delays. |
| `POST /api/cases` | Create a new demo case row. Optional for the current scripted demo. |
| `POST /api/cases/:id/chat` | Send an analyst message to one or more agents. The backend selects mentioned agents (`@customer`, `@merchant`, `@network`, `@policy`) or all agents by default, gathers TiDB-backed tool observations for those agents, calls the configured Codex CLI provider when available, and returns `CaseEvent[]` for the live conversation. |
| `POST /api/cases/:id/execute` | Run/replay investigation, persist timeline, agent findings, synthesis, and actions, then return the updated `Case`. |

## Existing TiDB Tables

The current import script creates the normalized operational tables:

```sql
customers(id, name, risk_tier, country, created_at, median_payment)
merchants(id, name, category, country, risk_score)
transactions(id, source, customer_id, merchant_id, amount, currency, status, occurred_at, raw_type, is_fraud, is_flagged_fraud)
risk_cases(id, source, transaction_id, priority, status, reason, created_at)
evidence_files(id, case_id, kind, title, uri, summary)
network_edges(id, case_id, source, target, edge_type, risk)
memory_events(id, subject_type, subject_id, event_type, content, confidence, created_at)
agent_findings(id, case_id, agent_name, finding, confidence, created_at)
policy_documents(id, title, content, updated_at)
```

These tables are still useful. They should remain the source of truth for business facts and audit data.

## Proposed Schema Additions

The new frontend needs richer workflow and case-state fields.

### Extend Existing Tables

```sql
ALTER TABLE customers
  ADD COLUMN email VARCHAR(256) NULL,
  ADD COLUMN phone VARCHAR(64) NULL,
  ADD COLUMN initials VARCHAR(8) NULL,
  ADD COLUMN member_since DATE NULL,
  ADD COLUMN tier VARCHAR(32) NULL;

ALTER TABLE merchants
  ADD COLUMN city VARCHAR(128) NULL;

ALTER TABLE risk_cases
  ADD COLUMN unread INT NOT NULL DEFAULT 0,
  ADD COLUMN contact TEXT NULL,
  ADD COLUMN resolved_at DATETIME NULL;
```

### Add Workflow Tables

```sql
CREATE TABLE IF NOT EXISTS case_timeline_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  event_order INT NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  agent_id VARCHAR(32) NULL,
  ts_label VARCHAR(32) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_case_event_order (case_id, event_order),
  INDEX idx_case_timeline (case_id, event_order)
);

CREATE TABLE IF NOT EXISTS case_agent_status (
  case_id VARCHAR(32) NOT NULL,
  agent_id VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id, agent_id)
);

CREATE TABLE IF NOT EXISTS case_synthesis (
  case_id VARCHAR(32) PRIMARY KEY,
  score INT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  narrative TEXT NOT NULL,
  payload JSON NOT NULL,
  resolved_payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  action_detail TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  executed_at DATETIME NULL,
  INDEX idx_case_actions (case_id, status)
);
```

## Mapping Notes

The adapter should keep the frontend contract stable and hide schema details from the UI.

Suggested mappings:

- `CaseListItem.id` <- `risk_cases.id`
- `CaseListItem.customer` <- `customers.name`
- `CaseListItem.merchant` <- `merchants.name`
- `CaseListItem.amount` <- `transactions.amount`
- `CaseListItem.status` <- `risk_cases.status`
- `Case.customer` <- `customers` plus derived fields such as initials and tier
- `Case.transaction` <- `transactions` joined with merchant context
- `Case.evidence` <- `evidence_files`, `network_edges`, `memory_events`, and `policy_documents`
- `Case.timeline` <- live backend agent skills over `risk_cases`, `transactions`, `customers`, `merchants`, `network_edges`, `memory_events`, and `policy_documents` (persisted `case_timeline_events` remains useful as seed/history)
- `Case.synthesis` <- `case_synthesis`
- `Case.actions` <- `case_actions`

Keep large or UI-specific nested structures in JSON columns only for workflow payloads. The core business facts should stay normalized so the demo can tell a credible TiDB storage story.

## MSW Fallback Strategy

Use the existing MSW fixtures as optional seed/fallback data:

1. Export the Sarah Chen / `CASE-2461` fixture into SQL seed rows.
2. Keep the fixture values stable so screenshots and demos do not drift.
3. Keep backend adapter endpoints aligned with the same payload shape.
4. Run the frontend against the real API by default.
5. Enable MSW only for offline demos and UI development with `NEXT_PUBLIC_USE_MSW=true`.

## Demo Narrative

The final story should be:

```text
TiDB stores the live operational facts and investigation history.
Agents read the current case state, retrieve historical memory and policy context, stream work into the timeline, and write back evidence-bound outcomes.
The frontend renders that state as an analyst workspace rather than treating AI output as an opaque chat transcript.
```

Current live agent-skill path:

- `customer_history.lookup` reads customer profile, transaction amount, and customer memory.
- `merchant_risk.score` reads merchant profile and merchant memory.
- `network_graph.expand` reads case graph edges and evidence references.
- `policy_match.evaluate` reads policy context and computed case facts.

Each agent timeline message carries an `inspect` block with the skill name, SQL-like query, source tables, intermediate results, evidence, generated artifact name, and response source.

The initial investigation timeline and bottom analyst chatbox both use the same real-agent path. For timeline replay, the backend runs all four lanes (`customer`, `merchant`, `network`, `policy`) against the current case. For chat, a message can target a specific lane with `@customer`, `@merchant`, `@network`, or `@policy`; otherwise all four agents respond. In both paths, the backend gathers scoped tool observations from the current TiDB case bundle, sends the task/context to local `codex exec`, and returns `CaseEvent[]` or timeline entries that the frontend folds into the live workspace. If Codex CLI is unavailable or times out, the endpoint returns deterministic fallback responses and `/api/health` reports the active `agentRuntime`.
