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
  viz: CustomerHistoryViz;
  finding: string;
  inspect: InspectItem[];
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
  viz: MerchantGaugeViz;
  finding: string;
  inspect: InspectItem[];
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
  viz: PolicyLookupViz;
  finding: string;
  inspect: InspectItem[];
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
