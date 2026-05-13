# AI Risk Investigation Demo

This is a starter implementation for the fintech risk-investigation demo discussed in the Feishu minutes.

The demo shows a case-review console where agents investigate suspicious transactions by combining:

- customer history
- merchant risk patterns
- transaction-network relationships
- policy checks
- prior case memory

The agent workflow is intentionally **not** placed in the millisecond-level transaction authorization path. The intended production story is: rules / ML / graph features create or hold suspicious cases first, then agents perform investigation and produce an evidence-bound dossier.

The first version uses deterministic local agents and seeded data so the workflow is stable for demos. The API can run against local files or a TiDB Zero backend with the same UI.

## Planning Docs

- [Motivation](docs/motivation.md)
- [Design](docs/design.md)
- [Task Breakdown](docs/task-breakdown.md)

## Run

```bash
npm install
npm run dev:api
```

In another terminal:

```bash
npm run dev:web
```

Open:

```text
http://127.0.0.1:5177
```

The API listens on:

```text
http://127.0.0.1:8787
```

## TiDB Zero Backend

The demo can be run with TiDB Zero as the backend storage:

```bash
npm run import:tidb
npm run dev:api:tidb
```

`import:tidb` creates/uses the logical TiDB database `riskops_ai_demo` and imports the guided dataset plus generated PaySim-like data.

On this machine, `dev:api:tidb` uses the existing local TiDB Zero configuration wrapper. On another machine, set these environment variables instead:

```text
TIDB_DEMO_HOST
TIDB_DEMO_PORT
TIDB_DEMO_USER
TIDB_DEMO_PASSWORD
TIDB_DEMO_DATABASE
TIDB_DEMO_SSL_CA
```

You can confirm the active backend with:

```bash
curl http://127.0.0.1:8787/api/health
```

Expected TiDB-backed response includes:

```json
{ "repository": "tidb" }
```

## Current Demo Flow

1. Pick a suspicious transaction case from the queue.
   - **Guided** mode uses three curated story cases from `data/seed.json`.
   - **Scale** mode loads generated PaySim-like cases from `data/paysim-like/*.csv`.
2. Review customer, merchant, transaction, policy, and evidence context.
3. Click **Run Investigation**.
4. The UI runs the investigation in staged mode instead of finishing instantly:
   - loading TiDB case bundle
   - retrieving policy and memory context
   - running each specialized agent
   - writing findings
   - generating the final dossier
5. The UI shows five agent findings:
   - Customer History Agent
   - Merchant Risk Agent
   - Network Graph Agent
   - Policy Agent
   - Memory Agent
6. After completion, the Agent Workspace stays compact. Each agent appears as a summary button; click it to open the detailed agent work page with input tables, TiDB-style query, reasoning steps, evidence, and writeback target.
7. The console produces a final risk score, conclusion, and recommended actions.

## Synthetic Data Strategy

The default `data/seed.json` is a small deterministic dataset used to keep the live demo stable.

For larger datasets, use a PaySim-style generator:

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

The transaction CSV keeps PaySim-compatible fields:

```text
step,type,amount,nameOrig,oldbalanceOrg,newbalanceOrig,nameDest,oldbalanceDest,newbalanceDest,isFraud,isFlaggedFraud
```

We use the PaySim idea as a data-generation model, not its GPL-licensed Java source. The extra derived tables are what make the dataset useful for the agent demo: cases, evidence, network edges, and memory events.

The API now supports both sources:

```text
GET /api/cases?source=guided
GET /api/cases?source=generated&priority=P1&limit=500
GET /api/cases?source=generated&q=RC00000008
POST /api/cases/RC00000008/investigate
```

The UI's **Scale** toggle uses the generated source and keeps the same investigation workflow, so the demo can show both narrative depth and a larger TiDB-style case queue.

## TiDB Schema

The demo imports into these TiDB tables:

```sql
CREATE TABLE customers (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128),
  risk_tier VARCHAR(32),
  country VARCHAR(32),
  created_at TIMESTAMP,
  median_payment DECIMAL(18,2)
);

CREATE TABLE merchants (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128),
  category VARCHAR(64),
  risk_score INT,
  country VARCHAR(32)
);

CREATE TABLE transactions (
  id VARCHAR(32) PRIMARY KEY,
  source VARCHAR(16),
  customer_id VARCHAR(32),
  merchant_id VARCHAR(32),
  amount DECIMAL(18,2),
  currency VARCHAR(8),
  status VARCHAR(32),
  occurred_at TIMESTAMP,
  raw_type VARCHAR(32),
  is_fraud TINYINT,
  is_flagged_fraud TINYINT,
  INDEX idx_customer_time (customer_id, occurred_at),
  INDEX idx_merchant_time (merchant_id, occurred_at)
);

CREATE TABLE risk_cases (
  id VARCHAR(32) PRIMARY KEY,
  source VARCHAR(16),
  transaction_id VARCHAR(32),
  status VARCHAR(32),
  priority VARCHAR(16),
  reason TEXT,
  created_at TIMESTAMP
);

CREATE TABLE evidence_files (
  id VARCHAR(32) PRIMARY KEY,
  case_id VARCHAR(32),
  kind VARCHAR(64),
  title VARCHAR(256),
  uri TEXT,
  summary TEXT
);

CREATE TABLE memory_events (
  id VARCHAR(32) PRIMARY KEY,
  subject_id VARCHAR(32),
  subject_type VARCHAR(32),
  event_type VARCHAR(64),
  content TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMP,
  INDEX idx_subject (subject_type, subject_id, created_at)
);

CREATE TABLE network_edges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32),
  source VARCHAR(64),
  target VARCHAR(64),
  edge_type VARCHAR(64),
  risk INT
);

CREATE TABLE agent_findings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32),
  agent_name VARCHAR(128),
  finding TEXT,
  confidence DECIMAL(5,4),
  created_at TIMESTAMP
);

CREATE TABLE policy_documents (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256),
  content MEDIUMTEXT,
  updated_at TIMESTAMP
);
```

## Next Integration Steps

- Add real LLM calls behind each agent.
- Store agent outputs as `memory_events`.
- Add evidence PDF generation and sharing.
- Generate larger synthetic datasets with `npm run seed`.
