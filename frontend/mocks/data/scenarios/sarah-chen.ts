import type {
  AgentMessage,
  AnalystMessage,
  Scenario,
  SynthesisResult,
  SystemEvent,
} from "@/types/api";
import { SARAH_CHEN } from "../sarah-chen";
import { TIMELINE_SARAH_CHEN } from "../sarah-chen-timeline";

// Pulls the existing static timeline apart so we can re-emit each piece
// as its own SSE event. Order in the timeline array is preserved:
//   [0] system event
//   [1] customer history
//   [2] merchant analysis
//   [3] network graph (initial)
//   [4] Maya intervention
//   [5] network graph (reply to Maya)
//   [6] policy lookup
//   [7] synthesis (resolved)

const systemOpened = TIMELINE_SARAH_CHEN[0] as SystemEvent;
const customer = TIMELINE_SARAH_CHEN[1] as AgentMessage;
const merchant = TIMELINE_SARAH_CHEN[2] as AgentMessage;
const networkInitial = TIMELINE_SARAH_CHEN[3] as AgentMessage;
const maya = TIMELINE_SARAH_CHEN[4] as AnalystMessage;
const networkReply = TIMELINE_SARAH_CHEN[5] as AgentMessage;
const policy = TIMELINE_SARAH_CHEN[6] as AgentMessage;
const fullSynthesis = TIMELINE_SARAH_CHEN[7] as SynthesisResult;

// Synthesis lands in awaiting state. case_resolved is no longer baked
// into the scenario — the handler appends it only when MSW state shows
// the analyst has clicked Execute on this case.
const synthesisPending: SynthesisResult = {
  ...fullSynthesis,
  resolved: undefined,
};

// Total runtime ≈ 14.5s. Fast enough to demo repeatedly, slow enough
// that each step is legible.
export const SARAH_CHEN_SCENARIO: Scenario = [
  { delay: 0,    event: { type: "case_meta",       case: SARAH_CHEN } },
  { delay: 200,  event: { type: "system_event",    entry: systemOpened } },

  // Four agents join the channel and start working.
  { delay: 200,  event: { type: "agent_status",    agent: "customer", status: "working" } },
  { delay: 60,   event: { type: "agent_status",    agent: "merchant", status: "working" } },
  { delay: 60,   event: { type: "agent_status",    agent: "network",  status: "working" } },
  { delay: 60,   event: { type: "agent_status",    agent: "policy",   status: "working" } },

  // Customer History reports first.
  { delay: 2000, event: { type: "agent_message",   entry: customer } },
  { delay: 100,  event: { type: "agent_status",    agent: "customer", status: "done" } },

  // Merchant Analysis next.
  { delay: 1800, event: { type: "agent_message",   entry: merchant } },
  { delay: 100,  event: { type: "agent_status",    agent: "merchant", status: "done" } },

  // Network Graph's initial cluster read.
  { delay: 1800, event: { type: "agent_message",   entry: networkInitial } },

  // Maya jumps in mid-flow.
  { delay: 1500, event: { type: "analyst_message", entry: maya } },

  // Network answers Maya and finishes.
  { delay: 900,  event: { type: "agent_message",   entry: networkReply } },
  { delay: 100,  event: { type: "agent_status",    agent: "network",  status: "done" } },

  // Policy closes the loop.
  { delay: 1500, event: { type: "agent_message",   entry: policy } },
  { delay: 100,  event: { type: "agent_status",    agent: "policy",   status: "done" } },

  // Synthesis card lands in awaiting state. The analyst's Execute click
  // (handled by the synthesis card itself) is what flips this case to
  // resolved — no auto-resolution from the scenario.
  { delay: 1500, event: { type: "synthesis_ready", entry: synthesisPending } },
];
