import type { Case, Scenario } from "@/types/api";

// Thin scenario for any non-Sarah case. Each agent comes online,
// "works" for ~7–11s, then finishes. The conversation stays sparse
// (one system line) — Phase 1 doesn't fabricate agent narratives for
// stub cases — but the right-panel lane status feels alive.
//
// Total runtime ≈ 11s.
export function stubScenario(c: Case): Scenario {
  return [
    { delay: 0,    event: { type: "case_meta",    case: c } },
    {
      delay: 200,
      event: {
        type: "system_event",
        entry: {
          type: "system",
          ts: c.transaction.time,
          text: `Case ${c.id} opened · auto-triage flagged ${c.priority.toUpperCase()} priority · 4 agents joined the channel.`,
        },
      },
    },
    // 4 agents come online almost in parallel.
    { delay: 300, event: { type: "agent_status", agent: "customer", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "merchant", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "network",  status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "policy",   status: "working" } },

    // Agents finish their work staggered, in roughly the order Sarah's
    // canonical scenario uses.
    { delay: 7000, event: { type: "agent_status", agent: "customer", status: "done" } },
    { delay: 1500, event: { type: "agent_status", agent: "merchant", status: "done" } },
    { delay: 1300, event: { type: "agent_status", agent: "network",  status: "done" } },
    { delay: 1200, event: { type: "agent_status", agent: "policy",   status: "done" } },
  ];
}
