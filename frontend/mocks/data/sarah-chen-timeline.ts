import type {
  CustomerScatterPoint,
  NetworkEdge,
  NetworkNode,
  TimelineEntry,
} from "@/types/api";

// ─── Customer History: scatter (hour-of-day × amount, 8y baseline) ──────
const CUSTOMER_BASELINE: CustomerScatterPoint[] = [
  [9.2, 42],   [10.1, 68],  [11.0, 95],  [11.5, 55],  [12.3, 120], [12.4, 88],
  [12.8, 40],  [13.0, 150], [13.1, 72],  [13.3, 28],  [13.6, 210], [14.0, 64],
  [14.4, 180], [14.8, 96],  [15.0, 52],  [15.2, 38],  [15.4, 138], [15.6, 84],
  [15.8, 42],  [16.0, 76],  [16.2, 168], [16.5, 108], [16.7, 55],  [16.9, 32],
  [17.1, 210], [17.3, 86],  [17.5, 46],  [17.7, 124], [17.9, 72],  [18.0, 38],
  [18.2, 158], [18.4, 92],  [18.6, 64],  [18.8, 114], [19.0, 46],  [19.2, 86],
  [19.5, 212], [19.7, 58],  [19.9, 42],  [20.1, 148], [20.3, 92],  [20.5, 68],
  [20.7, 116], [20.9, 40],  [21.1, 82],  [21.3, 164], [21.5, 58],  [21.7, 38],
  [21.9, 108], [22.0, 72],  [10.6, 52],  [11.8, 142], [12.6, 68],  [13.8, 196],
  [14.6, 78],  [15.5, 118], [16.3, 88],  [17.4, 148], [18.5, 62],  [19.4, 176],
  [20.4, 52],  [21.0, 128], [12.0, 32],  [13.5, 224], [14.9, 42],  [16.1, 196],
  [17.2, 68],  [18.3, 108], [19.6, 38],  [20.6, 154], [15.7, 72],  [16.8, 52],
];

// ─── Network: positions reproduced from reference (seeded pseudo-random) ─
function buildNetworkGraph(): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  // Receiver at the center
  nodes.push({ id: "r0", x: 160, y: 90, r: 6, kind: "receiver" });
  // 6 settlement accounts inner ring (first 3 are mules)
  const settleR = 32;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    nodes.push({
      id: `s${i}`,
      x: 160 + Math.cos(a) * settleR,
      y: 90 + Math.sin(a) * settleR,
      r: 3.4,
      kind: i < 3 ? "mule" : "settle",
    });
    edges.push({ a: "r0", b: `s${i}`, mule: i < 3 });
  }
  // 40 outer nodes — 18 victims, 22 neutral
  let seed = 91;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 40; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 50 + rand() * 36;
    const x = 160 + Math.cos(angle) * radius;
    const y = 90 + Math.sin(angle) * radius * 0.72;
    const victim = i < 18;
    nodes.push({
      id: `n${i}`,
      x,
      y,
      r: 2.6 + rand() * 0.8,
      kind: victim ? "victim" : "neutral",
    });
    const parent = `s${i % 6}`;
    edges.push({ a: parent, b: `n${i}`, mule: false });
    if (i % 5 === 0 && i > 0) {
      edges.push({ a: `n${i}`, b: `n${i - 3}`, mule: false });
    }
  }
  return { nodes, edges };
}

const NETWORK_GRAPH = buildNetworkGraph();

// ─── Timeline ───────────────────────────────────────────────────────────
// Strict transcription of the scenario script in CLAIMS_DESIGN.md.
// Phase 1 default render is the resolved state — see SynthesisResult.resolved.
export const TIMELINE_SARAH_CHEN: TimelineEntry[] = [
  // System: case opened
  {
    type: "system",
    ts: "03:14:24",
    text: "Case CASE-2461 opened · auto-triage flagged HIGH RISK · 4 agents joined the channel.",
  },

  // Customer History agent
  {
    type: "agent",
    agent: "customer",
    ts: "03:14:28",
    narrative:
      "This is the strongest pattern break in Sarah's 8-year history. The amount is 50× her mean ticket, the timestamp is 4 hours outside any prior session window, and the location is novel — she has not transacted internationally since a 2019 Paris trip. Treating this as a high-confidence anomaly.",
    viz: {
      baseline: CUSTOMER_BASELINE,
      outlier: { x: 3.23, y: 4280, label: "TONIGHT" },
      caption: "$4,280 in Bali at 03:14 PT sits 6.4σ from her 8-year baseline.",
    },
    finding: "Anomaly across all three axes · amount z=6.4 · hour z=4.1 · geography novel.",
    inspect: [
      { kind: "tool", name: "tidb.txn_history", q: "WHERE member_id = m_8821 RANGE 8y" },
      {
        kind: "result",
        text: "4,127 rows scanned · 38ms · mean_ticket=$84 · hours 09:00–22:00 PT · last_intl_txn = 2019-04-12 (CDG, FR)",
      },
      { kind: "file", name: "customer_pattern_anomaly.md", size: "2.1 KB" },
    ],
  },

  // Merchant Analysis agent
  {
    type: "agent",
    agent: "merchant",
    ts: "03:14:35",
    narrative:
      "The acceptor is PT Sunset Holdings — gambling MCC, registered Sept 2024, so only 8 months old. Its 90-day chargeback rate is 4× the industry p99 and two acquirers have terminated it in the last 18 months. By itself this would justify a manual review.",
    viz: {
      merchantRate: 8.2,
      industry: { p50: 0.5, p90: 1.4, p99: 2.1 },
      max: 10,
      caption: "PT Sunset Holdings · 8.2% chargeback rate · 4× industry p99.",
    },
    finding: "High-risk acceptor · 8.2% chargeback rate · 4× industry p99.",
    inspect: [
      { kind: "tool", name: "tidb.merchants ⋈ disputes", q: "merchant_id = mch_BL_2904 RANGE 90d" },
      {
        kind: "result",
        text: "1 row · vector match on adverse-media index · 14ms · cb_rate_90d=0.082 · p99_industry=0.021 · acquirer_terminations=2",
      },
      { kind: "file", name: "merchant_risk_report.md", size: "3.4 KB" },
    ],
  },

  // Network Graph agent — initial analysis (replies to Customer)
  {
    type: "agent",
    agent: "network",
    ts: "03:14:41",
    mention: "customer",
    narrative:
      "@customer.history Building on your novel-geography read. The receiving account sits inside RING-142, a cluster we already know about — 47 nodes, 18 prior victims, active since March. The mule edges are tight and the cluster confidence is 0.91, which is well above our action threshold.",
    viz: {
      nodes: NETWORK_GRAPH.nodes,
      edges: NETWORK_GRAPH.edges,
      caption: "RING-142 · 47 nodes · 18 prior victims · 0.91 cluster confidence.",
    },
    finding: "Receiving account links to RING-142 · 18 prior victims · 0.91 cluster confidence.",
    inspect: [
      {
        kind: "tool",
        name: "graph.bfs + vector.search",
        q: "FROM acq_A91F DEPTH 2  ANN k=10 ON ring_emb",
      },
      {
        kind: "result",
        text: "47 nodes · 6 settlement accts · 3 mule signals · 412ms · matched RING-142 (cosine=0.91)",
      },
      { kind: "file", name: "network_graph.json", size: "11.8 KB" },
    ],
  },

  // Maya Singh — analyst intervention
  {
    type: "analyst",
    user: "maya",
    ts: "03:14:49",
    text: "@network.history is any of the 18 prior victims also a Premium tier customer? Trying to gauge if this ring targets our segment.",
  },

  // Network Graph agent — follow-up reply to Maya, no viz/finding/inspect
  {
    type: "agent",
    agent: "network",
    ts: "03:14:51",
    mention: "maya",
    narrative:
      "@maya 11 of 18 are Premium, 4 Business, 3 Standard. The selectivity looks ticket-size driven rather than tier driven — every victim charge sat between $2.8k and $6.2k. Sarah's $4,280 lands right in the middle of that band.",
  },

  // Policy Lookup agent
  {
    type: "agent",
    agent: "policy",
    ts: "03:14:53",
    narrative:
      "Read four facts from mem9 — pattern anomaly, high-risk merchant, ring match, Premium tier — and matched them against active policies. Two trigger: Reg E §1005.11 covers the unauthorized EFT path, and Internal P-12 requires an auto-hold when the amount exceeds $1,000 and a ring match is present. Premium tier puts the provisional credit SLA at one hour.",
    viz: {
      rows: [
        {
          code: "Reg E §1005.11",
          title: "Unauthorized EFT",
          trigger: "Cardholder disputes transaction in-app + ring match present",
          eligibility: [
            "Provisional credit within 10 business days",
            "Investigation up to 45 days",
          ],
        },
        {
          code: "Internal P-12",
          title: "Auto-hold on cluster match",
          trigger: "Amount ≥ $1,000 AND cluster confidence ≥ 0.85",
          eligibility: [
            "Suspend card immediately",
            "1h provisional credit (Premium SLA)",
            "Open dispute case",
          ],
        },
      ],
      caption: "Premium SLA · 1-hour provisional credit window.",
    },
    finding: "Auto-hold + $4,280 provisional credit eligible under P-12 · Premium 1h SLA.",
    inspect: [
      {
        kind: "tool",
        name: "mem9.read + policy.match",
        q: "case=2461 facts=[anomaly, merchant_risk, ring_match, tier=premium]",
      },
      {
        kind: "result",
        text: "4 facts read · 2 policies matched · 9ms · regE_1005_11 + internal_p12 · sla_provisional=1h",
      },
      { kind: "file", name: "policy_match.md", size: "1.7 KB" },
    ],
  },

  // Synthesis — system-level recommendation, rendered in resolved state.
  {
    type: "synthesis",
    ts: "03:14:56",
    score: 94,
    confidence: 0.97,
    verdicts: [
      { agent: "customer", label: "Anomaly",  level: "HIGH",      tone: "danger" },
      { agent: "merchant", label: "Merchant", level: "HIGH",      tone: "danger" },
      { agent: "network",  label: "Network",  level: "HIGH",      tone: "danger" },
      { agent: "policy",   label: "Policy",   level: "AUTO-HOLD", tone: "warn"   },
    ],
    narrative:
      "Three high-severity signals stack on one transaction: a 6.4σ behavioral break, a 4× p99 acceptor, and a confirmed RING-142 receiver. Reg E §1005.11 + Internal P-12 support automatic action; Premium tier puts the provisional credit SLA at one hour.",
    file: "recommended_action.md",
    cited: [
      { f: "customer_pattern_anomaly.md", a: "customer" },
      { f: "merchant_risk_report.md",     a: "merchant" },
      { f: "network_graph.json",          a: "network"  },
      { f: "policy_match.md",             a: "policy"   },
    ],
    actions: [
      { t: "Suspend card",            d: "•••• 4421 · effective immediately" },
      { t: "Issue provisional credit", d: "$4,280.00 → acct 8210" },
      { t: "Open dispute case",        d: "Reg E §1005.11 · 10-day SLA" },
      { t: "Write pattern → mem9",     d: "cluster_RING_142" },
    ],
    resolved: {
      dispute_id: "DSP-9921",
      pattern_saved: "cluster_RING_142",
    },
  },
];
