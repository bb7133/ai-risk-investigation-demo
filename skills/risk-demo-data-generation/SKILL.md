---
name: risk-demo-data-generation
description: Use when generating, refreshing, importing, or validating the AI risk investigation demo dataset, including PaySim-style transactions, risk cases, workflow CSVs, and TiDB-backed demo tables.
---

# Risk Demo Data Generation

Use this skill when the user asks to create more open cases, refresh the simulated data, import data into TiDB, or explain where demo data comes from.

## Workflow

1. Confirm the desired dataset size and risk shape.
   - Default: `DEMO_TXN_COUNT=100000`
   - Useful knobs: `DEMO_CLIENTS`, `DEMO_MERCHANTS`, `DEMO_FRAUD_RATE`, `DEMO_FLAGGED_LIMIT`
2. Generate the PaySim-style CSV dataset:

   ```bash
   DEMO_TXN_COUNT=100000 npm run seed:paysim
   ```

3. Confirm the generated files under `data/paysim-like/`:
   - `transactions.csv`
   - `risk_cases.csv`
   - `network_edges.csv`
   - `memory_events.csv`
   - `case_timeline_events.csv`
   - `case_agent_status.csv`
   - `case_synthesis.csv`
   - `case_actions.csv`
4. Import into TiDB when the demo should use the real backend:

   ```bash
   npm run import:tidb
   ```

5. Restart the API service if a persistent local service is running:

   ```bash
   launchctl kickstart -k gui/$(id -u)/local.ai-risk-demo.api
   ```

6. Validate the active repository and case count:

   ```bash
   curl -sS http://127.0.0.1:8787/api/health
   curl -sS 'http://127.0.0.1:8787/api/cases?source=generated&priority=all&limit=5'
   ```

## Data Model Notes

- The generator borrows the PaySim domain shape; it does not vendor PaySim source code.
- The data story is two-stage: rules/ML/graph features create suspicious cases first, then AI agents investigate cases.
- TiDB tables are the source of truth for live demo facts: `transactions`, `customers`, `merchants`, `risk_cases`, `evidence_files`, `network_edges`, `memory_events`, `case_timeline_events`, `case_agent_status`, `case_synthesis`, and `case_actions`.
- Keep generated demo CSVs committed only when the user wants reproducible demo data in the repo.

## Safety

- Never commit TiDB Cloud connection details, certificates, passwords, or shell env files.
- Prefer `scripts/with-tidb-zero-env.mjs` or local environment variables for credentials.
- After importing, verify with API reads instead of assuming the import succeeded.
