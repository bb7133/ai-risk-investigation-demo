import type { Case, Scenario } from "@/types/api";

// Thin scenario for any case other than Sarah Chen — emits case_meta,
// a single system line, and the 4 agents going into "working" state.
// No messages, no synthesis. The right panel shows live activity but
// the conversation stays sparse.
export function stubScenario(c: Case): Scenario {
  return [
    { delay: 0,    event: { type: "case_meta",    case: c } },
    {
      delay: 200,
      event: {
        type: "system_event",
        entry: {
          type: "system",
          ts: "—",
          text: `Case ${c.id} opened · auto-triage flagged ${c.priority.toUpperCase()} priority · 4 agents joined the channel.`,
        },
      },
    },
    { delay: 300, event: { type: "agent_status", agent: "customer", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "merchant", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "network",  status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "policy",   status: "working" } },
  ];
}
