import type {
  AgentId,
  Case,
  CaseEvent,
  CaseListItem,
  CasePriority,
  CaseStatus,
  CitedFile,
  InspectItem,
  SynthAction,
  SynthesisResolvedMeta,
  TimelineEntry,
  Verdict,
} from "@/types/api";

type BackendCaseListResponse = {
  repository: string;
  total: number;
  cases: BackendCaseRow[];
};

type BackendCaseRow = {
  id: string;
  transactionId: string;
  priority: string;
  status: string;
  unread?: number;
  contact?: string | null;
  createdAt?: string;
  customer: string;
  merchant: string;
  city?: string | null;
  amount: number;
  currency: string;
  merchantRisk?: number;
  source?: string;
};

type BackendBundle = {
  source: string;
  case: {
    id: string;
    transactionId: string;
    priority: string;
    status: string;
    reason: string;
    createdAt: string;
    unread?: number;
    contact?: string | null;
    resolvedAt?: string | null;
  };
  transaction: {
    id: string;
    customerId: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: string;
    occurredAt: string;
  };
  customer: {
    id: string;
    name: string;
    riskTier?: string;
    country?: string;
    createdAt?: string;
    medianPayment?: number;
    email?: string;
    phone?: string;
    initials?: string;
    memberSince?: string;
    tier?: string;
  };
  merchant: {
    id: string;
    name: string;
    category?: string;
    country?: string;
    city?: string;
    riskScore: number;
  };
};

type RawTimelineEntry = {
  type: string;
  ts?: string;
  text?: string;
  agent?: string;
  narrative?: string;
  finding?: string;
  inspect?: InspectItem[];
  viz?: unknown;
  mention?: string;
  score?: number;
  confidence?: number;
  file?: string;
  resolved?: SynthesisResolvedMeta;
  actions?: SynthAction[];
  cited?: CitedFile[];
  verdicts?: Verdict[];
};

const AGENTS = new Set<AgentId>(["customer", "merchant", "network", "policy"]);

export function backendBaseURL(): string {
  return (
    process.env.RISK_API_BASE ||
    process.env.NEXT_PUBLIC_RISK_API_BASE ||
    "http://127.0.0.1:8787"
  ).replace(/\/$/, "");
}

function caseSource(): string {
  return process.env.RISK_CASE_SOURCE || "generated";
}

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${backendBaseURL()}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `backend ${path} failed: ${res.status} ${res.statusText}${body ? `: ${body}` : ""}`,
    );
  }
  return (await res.json()) as T;
}

export async function listRealCases(limit = 250): Promise<CaseListItem[]> {
  const data = await backendFetch<BackendCaseListResponse>(
    `/api/cases?source=${encodeURIComponent(caseSource())}&priority=all&limit=${limit}`,
  );
  return data.cases.map(toCaseListItem);
}

export async function getRealCase(id: string): Promise<Case> {
  const bundle = await backendFetch<BackendBundle>(`/api/cases/${encodeURIComponent(id)}`);
  return toCase(bundle);
}

export async function getRealTimeline(id: string): Promise<TimelineEntry[]> {
  const rows = await backendFetch<RawTimelineEntry[]>(
    `/api/cases/${encodeURIComponent(id)}/timeline`,
  );
  return rows.map(toTimelineEntry).filter((entry): entry is TimelineEntry => !!entry);
}

export async function resolveRealCase(id: string): Promise<SynthesisResolvedMeta> {
  return backendFetch<SynthesisResolvedMeta>(`/api/cases/${encodeURIComponent(id)}/execute`, {
    method: "POST",
  });
}

export async function chatWithRealAgents(id: string, message: string): Promise<CaseEvent[]> {
  return backendFetch<CaseEvent[]>(`/api/cases/${encodeURIComponent(id)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function buildCaseEvents(id: string): Promise<CaseEvent[]> {
  const [caseDetail, timeline] = await Promise.all([getRealCase(id), getRealTimeline(id)]);
  const events: CaseEvent[] = [{ type: "case_meta", case: caseDetail }];

  for (const entry of timeline) {
    switch (entry.type) {
      case "system":
        events.push({ type: "system_event", entry });
        break;
      case "agent":
        events.push({ type: "agent_status", agent: entry.agent, status: "working" });
        events.push({ type: "agent_message", entry });
        events.push({ type: "agent_status", agent: entry.agent, status: "done" });
        break;
      case "analyst":
        events.push({ type: "analyst_message", entry });
        break;
      case "synthesis":
        events.push({ type: "synthesis_ready", entry: { ...entry, type: "synthesis" } });
        break;
    }
  }

  return events;
}

function toCaseListItem(row: BackendCaseRow): CaseListItem {
  return {
    id: row.id,
    customer: row.customer,
    amount: money(row.amount, row.currency),
    city: row.city || "Unknown",
    status: toStatus(row.status),
    priority: toPriority(row.priority),
    unread: Number(row.unread || 0),
    when: relativeWhen(row.createdAt),
  };
}

function toCase(bundle: BackendBundle): Case {
  return {
    ...toCaseListItem({
      id: bundle.case.id,
      transactionId: bundle.case.transactionId,
      priority: bundle.case.priority,
      status: bundle.case.status,
      unread: bundle.case.unread,
      contact: bundle.case.contact,
      createdAt: bundle.case.createdAt,
      customer: bundle.customer.name,
      merchant: bundle.merchant.name,
      city: cityLabel(bundle.merchant.city, bundle.merchant.country),
      amount: bundle.transaction.amount,
      currency: bundle.transaction.currency,
      merchantRisk: bundle.merchant.riskScore,
      source: bundle.source,
    }),
    customer_detail: {
      member_id: bundle.customer.id,
      name: bundle.customer.name,
      tier: toTier(bundle.customer.tier || bundle.customer.riskTier),
      since: yearOrDash(bundle.customer.memberSince || bundle.customer.createdAt),
      email: bundle.customer.email || `${bundle.customer.id.toLowerCase()}@example.com`,
      phone: bundle.customer.phone || "+1 ··· ···· ····",
      initials: bundle.customer.initials || initials(bundle.customer.name),
    },
    transaction: {
      id: bundle.transaction.id,
      amount: money(bundle.transaction.amount, bundle.transaction.currency),
      amount_usd: Number(bundle.transaction.amount),
      merchant: bundle.merchant.name,
      city: cityLabel(bundle.merchant.city, bundle.merchant.country),
      time: timeLabel(bundle.transaction.occurredAt),
    },
    contact: bundle.case.contact || undefined,
  };
}

function toTimelineEntry(row: RawTimelineEntry): TimelineEntry | null {
  if (row.type === "system") {
    return {
      type: "system",
      ts: String(row.ts || "T+0s"),
      text: String(row.text || ""),
    };
  }

  if (row.type === "agent" && row.agent && isAgent(row.agent)) {
    return {
      type: "agent",
      agent: row.agent,
      ts: String(row.ts || "T+?"),
      narrative: String(row.narrative || row.finding || ""),
      finding: typeof row.finding === "string" ? row.finding : undefined,
      inspect: Array.isArray(row.inspect) ? row.inspect : undefined,
      viz: row.viz,
      mention: row.mention,
    } as TimelineEntry;
  }

  if (row.type === "analyst") {
    return {
      type: "analyst",
      user: "maya",
      ts: String(row.ts || "T+?"),
      text: String(row.text || ""),
    };
  }

  if (row.type === "synthesis" || row.type === "synthesis_ready") {
    return {
      type: "synthesis",
      ts: String(row.ts || "T+?"),
      score: Number(row.score || 0),
      confidence: Number(row.confidence || 0),
      verdicts: Array.isArray(row.verdicts) ? row.verdicts : [],
      narrative: String(row.narrative || ""),
      file: String(row.file || "recommended_action.md"),
      cited: Array.isArray(row.cited) ? row.cited : [],
      actions: Array.isArray(row.actions) ? row.actions : [],
      resolved: row.resolved,
    };
  }

  return null;
}

function isAgent(value: string): value is AgentId {
  return AGENTS.has(value as AgentId);
}

function toPriority(value: string): CasePriority {
  switch (value.toUpperCase()) {
    case "P1":
    case "HIGH":
      return "high";
    case "P2":
    case "MED":
    case "MEDIUM":
      return "med";
    default:
      return "low";
  }
}

function toStatus(value: string): CaseStatus {
  const normalized = value.toLowerCase();
  if (normalized === "investigating" || normalized === "resolved" || normalized === "auto") {
    return normalized;
  }
  return "awaiting";
}

function toTier(value?: string): "Premium" | "Business" | "Standard" {
  if (value === "Premium" || value === "Business" || value === "Standard") return value;
  if (value?.toLowerCase().includes("business")) return "Business";
  if (value?.toLowerCase().includes("standard")) return "Standard";
  return "Premium";
}

function money(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function cityLabel(city?: string, country?: string): string {
  return city || country || "Unknown";
}

function timeLabel(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function relativeWhen(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes || 1}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function yearOrDash(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : String(date.getUTCFullYear());
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
