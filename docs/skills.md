# Project Skills

This repository includes project-local skills for agents working on the AI risk investigation demo. They are lightweight operational guides, not runtime code.

## Available Skills

- `skills/risk-demo-data-generation/SKILL.md`
  - Use for generating PaySim-style simulated transactions, creating more open cases, importing CSVs into TiDB, and validating the live data.
- `skills/risk-demo-agent-configuration/SKILL.md`
  - Use for configuring and verifying the real AI agent runtime, including Codex CLI today and future local CLI adapters such as Claude Code.

## How To Use Them

When assigning work to an agent, point it at the relevant skill path before asking it to make changes. Example:

```text
Use skills/risk-demo-data-generation/SKILL.md and regenerate a 200k transaction dataset, import it into TiDB, then validate the case count.
```

```text
Use skills/risk-demo-agent-configuration/SKILL.md and configure the local service so all case-analysis agents run through Codex CLI.
```

These skills intentionally keep secrets out of the repository. TiDB and model-provider credentials should stay in local environment files or platform secret stores.
