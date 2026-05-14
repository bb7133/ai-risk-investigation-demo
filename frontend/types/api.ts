// API contract types for the CLAIMS frontend.
//
// This file is the source of truth for what shapes flow between the
// MSW handlers (frontend/mocks/) and the API client (frontend/lib/api/).
// When the real backend ships, only the API client base URL flips —
// these shapes stay.

// ─── Identifiers ────────────────────────────────────────────────────────
export type AgentId = "customer" | "merchant" | "network" | "policy";
export type AnalystId = "maya";
export type Mention = AgentId | AnalystId;

// ─── Inspect query (collapsed-by-default block under each agent msg) ────
export type InspectTool = { kind: "tool"; name: string; q: string };
export type InspectResult = { kind: "result"; text: string };
export type InspectFile = { kind: "file"; name: string; size: string };
export type InspectItem = InspectTool | InspectResult | InspectFile;

// ─── Agent message bodies ───────────────────────────────────────────────
// Each agent emits a narrative + signature viz + finding + inspect block.
// Network has an optional follow-up reply with no viz (Maya answer).

export type CustomerScatterPoint = readonly [hour: number, amount: number];

export type CustomerHistoryViz = {
  baseline: CustomerScatterPoint[];
  outlier: { x: number; y: number; label: string };
  caption: string;
};

export type CustomerHistoryMessage = {
  type: "agent";
  agent: "customer";
  ts: string;
  narrative: string;
  mention?: Mention;
  // Optional so stub scenarios can emit a narrative-only message
  // without authoring the full scatter + finding + inspect package.
  viz?: CustomerHistoryViz;
  finding?: string;
  inspect?: InspectItem[];
};

export type MerchantGaugeViz = {
  merchantRate: number;
  industry: { p50: number; p90: number; p99: number };
  max: number;
  caption: string;
};

export type MerchantAnalysisMessage = {
  type: "agent";
  agent: "merchant";
  ts: string;
  narrative: string;
  mention?: Mention;
  viz?: MerchantGaugeViz;
  finding?: string;
  inspect?: InspectItem[];
};

export type NetworkNodeKind = "receiver" | "victim" | "mule" | "settle" | "neutral";
export type NetworkNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: NetworkNodeKind;
};
export type NetworkEdge = { a: string; b: string; mule: boolean };
export type NetworkGraphViz = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  caption: string;
};

export type NetworkGraphMessage = {
  type: "agent";
  agent: "network";
  ts: string;
  narrative: string;
  mention?: Mention;
  // Initial analysis has viz/finding/inspect. Follow-up reply omits them.
  viz?: NetworkGraphViz;
  finding?: string;
  inspect?: InspectItem[];
};

export type PolicyRow = {
  code: string;
  title: string;
  trigger: string;
  eligibility: string[];
};

export type PolicyLookupViz = {
  rows: PolicyRow[];
  caption: string;
};

export type PolicyLookupMessage = {
  type: "agent";
  agent: "policy";
  ts: string;
  narrative: string;
  mention?: Mention;
  viz?: PolicyLookupViz;
  finding?: string;
  inspect?: InspectItem[];
};

export type AgentMessage =
  | CustomerHistoryMessage
  | MerchantAnalysisMessage
  | NetworkGraphMessage
  | PolicyLookupMessage;

// ─── Analyst (Maya's intervention) ──────────────────────────────────────
export type AnalystMessage = {
  type: "analyst";
  user: AnalystId;
  ts: string;
  text: string;
};

// ─── System events (case opened, auto-triage notice, etc.) ──────────────
export type SystemEvent = {
  type: "system";
  ts: string;
  text: string;
};

// ─── Synthesis (system-level recommendation block) ──────────────────────
export type VerdictTone = "danger" | "warn" | "ok";
export type Verdict = {
  agent: AgentId;
  label: string; // "Anomaly", "Merchant", "Network", "Policy"
  level: string; // "HIGH" | "AUTO-HOLD" | ...
  tone: VerdictTone;
};

export type CitedFile = { f: string; a: AgentId };
export type SynthAction = { t: string; d: string };

export type SynthesisResolvedMeta = {
  dispute_id: string; // e.g. "DSP-9921"
  pattern_saved: string; // e.g. "cluster_RING_142"
};

export type SynthesisResult = {
  type: "synthesis";
  ts: string;
  score: number; // 0..100
  confidence: number; // 0..1
  verdicts: Verdict[];
  narrative: string;
  file: string;
  cited: CitedFile[];
  actions: SynthAction[];
  resolved?: SynthesisResolvedMeta;
};

// ─── Timeline ───────────────────────────────────────────────────────────
export type TimelineEntry =
  | SystemEvent
  | AgentMessage
  | AnalystMessage
  | SynthesisResult;

// ─── Case event stream (SSE contract) ───────────────────────────────────
// The backend exposes /api/cases/:id/events as a text/event-stream that
// emits these events over the case lifecycle. The frontend consumes them
// and builds up timeline + agent-status state. Phase 1 simulates this
// stream via MSW; swapping in the real backend means pointing the fetch
// at a different URL with the same event shapes.

export type AgentLaneStatus = "idle" | "working" | "waiting" | "done";

export type CaseEvent =
  // First event on a stream — provides the static case header.
  | { type: "case_meta"; case: Case }
  // System lines in the conversation (case opened, auto-triage, etc.).
  | { type: "system_event"; entry: SystemEvent }
  // An agent lane changes status (idle → working → done).
  | { type: "agent_status"; agent: AgentId; status: AgentLaneStatus }
  // A full agent message lands in the conversation.
  | { type: "agent_message"; entry: AgentMessage }
  // Maya (analyst) intervenes.
  | { type: "analyst_message"; entry: AnalystMessage }
  // Synthesis card emits in awaiting state.
  | { type: "synthesis_ready"; entry: SynthesisResult }
  // Resolved metadata attaches to the synthesis card.
  | { type: "case_resolved"; resolved: SynthesisResolvedMeta };

// A scenario is the script that drives the MSW SSE handler. `delay` is
// milliseconds to wait before emitting `event` (relative to the previous
// step). The real backend doesn't use this — it emits events as agents
// actually report — but the contract on the wire is the same.
export type ScenarioStep = { delay: number; event: CaseEvent };
export type Scenario = ScenarioStep[];

// ─── Customer / transaction / case ──────────────────────────────────────
export type CustomerTier = "Premium" | "Business" | "Standard";

export type Customer = {
  member_id: string;
  name: string;
  tier: CustomerTier;
  since: string;
  email: string;
  phone: string;
  initials: string;
};

export type Transaction = {
  id: string;
  amount: string;
  amount_usd: number;
  merchant: string;
  city: string;
  time: string;
};

export type CaseStatus = "awaiting" | "investigating" | "resolved" | "auto";
export type CasePriority = "high" | "med" | "low";

// Sidebar list row — minimal data for the list view.
export type CaseListItem = {
  id: string;
  customer: string;
  amount: string;
  city: string;
  status: CaseStatus;
  priority: CasePriority;
  unread: number;
  when: string;
};

// Full case — header data plus optional contact callout for the right panel.
export type Case = CaseListItem & {
  customer_detail: Customer;
  transaction: Transaction;
  contact?: string; // "I did not make this transaction…"
};
