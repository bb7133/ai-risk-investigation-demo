import type { AgentId } from "@/types/api";

// Static data rendered in the Stack mode of the right panel — TiDB
// query log, mem9 facts, drive9 pinned files. Mirrors UNDER_HOOD in
// docs/design/reference-code/chat-data.jsx.

export type QueryKind = "OLTP" | "OLAP" | "VEC" | "GRAPH";

export type QueryLogEntry = {
  ts: string;
  kind: QueryKind;
  table: string;
  rows: string;
  latency: string;
  agent: AgentId;
  note?: string;
};

export type FactOp = "WRITE" | "READ" | "QUEUED";
export type FactEntry = {
  id: string;
  agent: AgentId;
  text: string;
  op: FactOp;
};

export type PinnedFile = {
  name: string;
  size: string;
  agent: AgentId;
};

export type StackData = {
  metrics: {
    qps: number;
    p99: string;
    vector: number;
    htap: string;
  };
  queries: QueryLogEntry[];
  mem9: {
    read: number;
    queued: number;
    facts: FactEntry[];
  };
  drive9: {
    pinned: number;
    files: PinnedFile[];
  };
  region: string;
  version: string;
};

export const STACK_DATA: StackData = {
  metrics: {
    qps: 1284,
    p99: "14.2 ms",
    vector: 312,
    htap: "OLTP 71% · OLAP 29%",
  },
  queries: [
    { ts: "03:14:28.041", kind: "OLTP",  table: "txn_history",  rows: "4,127",    latency: "38ms",  agent: "customer" },
    { ts: "03:14:28.083", kind: "OLAP",  table: "txn_history",  rows: "4,127",    latency: "11ms",  agent: "customer", note: "AGG mean+stddev" },
    { ts: "03:14:35.211", kind: "OLTP",  table: "merchants",    rows: "1",        latency: "4ms",   agent: "merchant" },
    { ts: "03:14:35.219", kind: "OLAP",  table: "disputes",     rows: "12,418",   latency: "14ms",  agent: "merchant", note: "cb_rate 90d window" },
    { ts: "03:14:35.241", kind: "VEC",   table: "merchant_emb", rows: "ANN k=10", latency: "6ms",   agent: "merchant", note: "adverse-media match" },
    { ts: "03:14:41.118", kind: "GRAPH", table: "accounts",     rows: "47",       latency: "38ms",  agent: "network",  note: "BFS DEPTH 2 from acq_A91F" },
    { ts: "03:14:41.198", kind: "VEC",   table: "ring_emb",     rows: "ANN k=10", latency: "8ms",   agent: "network",  note: "cosine 0.91 → RING-142" },
    { ts: "03:14:53.024", kind: "OLTP",  table: "mem9.facts",   rows: "4",        latency: "3ms",   agent: "policy" },
    { ts: "03:14:53.036", kind: "OLTP",  table: "policies",     rows: "2",        latency: "6ms",   agent: "policy",   note: "regE_1005_11, internal_p12" },
  ],
  mem9: {
    read: 4,
    queued: 1,
    facts: [
      { id: "fact_a1", agent: "customer", text: "amount_z=6.4 · hour_z=4.1 · geo=novel", op: "WRITE"  },
      { id: "fact_a2", agent: "merchant", text: "cb_rate_90d=0.082 · acq_term=2",         op: "WRITE"  },
      { id: "fact_a3", agent: "network",  text: "cluster=RING-142 · conf=0.91",           op: "WRITE"  },
      { id: "fact_a4", agent: "policy",   text: "tier=premium · sla=1h",                  op: "READ"   },
      { id: "fact_a5", agent: "policy",   text: "pattern_RING_142 · seen_in=CASE-2461",   op: "QUEUED" },
    ],
  },
  drive9: {
    pinned: 5,
    files: [
      { name: "customer_pattern_anomaly.md", size: "2.1 KB",  agent: "customer" },
      { name: "merchant_risk_report.md",     size: "3.4 KB",  agent: "merchant" },
      { name: "network_graph.json",          size: "11.8 KB", agent: "network"  },
      { name: "policy_match.md",             size: "1.7 KB",  agent: "policy"   },
      { name: "recommended_action.md",       size: "1.2 KB",  agent: "policy"   },
    ],
  },
  region: "tidb-cloud · us-west-2a",
  version: "v8.5.1",
};
