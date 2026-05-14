import type { AgentId } from "@/types/api";

export type AgentMeta = {
  id: AgentId;
  name: string;
  glyph: string;
  role: string;
  // CSS-variable references — use directly in inline styles or
  // `color-mix(in oklab, ${color} N%, white)` for tints / fills.
  color: string;
  tint: string;
};

export const AGENT_META: Record<AgentId, AgentMeta> = {
  customer: {
    id: "customer",
    name: "Customer History",
    glyph: "C",
    role: "Pattern & history specialist",
    color: "var(--c-customer)",
    tint: "var(--tint-customer)",
  },
  merchant: {
    id: "merchant",
    name: "Merchant Analysis",
    glyph: "M",
    role: "Acceptor & chargeback specialist",
    color: "var(--c-merchant)",
    tint: "var(--tint-merchant)",
  },
  network: {
    id: "network",
    name: "Network Graph",
    glyph: "N",
    role: "Graph & cluster specialist",
    color: "var(--c-network)",
    tint: "var(--tint-network)",
  },
  policy: {
    id: "policy",
    name: "Policy Lookup",
    glyph: "P",
    role: "Compliance & action specialist",
    color: "var(--c-policy)",
    tint: "var(--tint-policy)",
  },
};

export const ANALYST_META = {
  id: "maya" as const,
  name: "Maya Singh",
  role: "Senior analyst",
  initials: "MS",
  color: "#7a52d4",
};

export const TEAM_MEMBERS = [
  {
    id: "maya",
    name: "Maya Singh",
    initials: "MS",
    role: "Senior analyst · lead",
    color: "#7a52d4",
    is_you: true,
  },
  {
    id: "daniel",
    name: "Daniel Park",
    initials: "DP",
    role: "Risk ops manager",
    color: "#2e7ad1",
    is_you: false,
  },
  {
    id: "priya",
    name: "Priya Sharma",
    initials: "PS",
    role: "Fraud analyst · 2nd opinion",
    color: "#cf3e76",
    is_you: false,
  },
];
