import type { Case, CaseListItem, SynthesisResolvedMeta } from "@/types/api";
import { CASES } from "./data/cases";
import { SARAH_CHEN } from "./data/sarah-chen";
import { caseStub } from "./data/case-stub";

// In-memory state for MSW handlers. Mutable across requests in a single
// browser tab so POST /api/cases survives subsequent GETs. Resets on
// page reload — Phase 1 doesn't persist.

const CASE_LIST: CaseListItem[] = [...CASES];
const CASE_DETAILS = new Map<string, Case>();
CASE_DETAILS.set(SARAH_CHEN.id, SARAH_CHEN);

// Templates cycled through for newly created cases — keeps each click
// feeling like a distinct alert without writing a full scenario.
const NEW_CASE_TEMPLATES: Array<Pick<CaseListItem, "customer" | "amount" | "city"> & { merchant: string }> = [
  { customer: "Olivia Park",   amount: "$3,720.00", city: "Lagos, NG",        merchant: "GoldenSands Resort"   },
  { customer: "Hassan Mehdi",  amount: "$5,890.00", city: "Dubai, AE",        merchant: "Mirage Holdings"      },
  { customer: "Yuna Kim",      amount: "$2,340.00", city: "Phuket, TH",       merchant: "Beach Club Nine"      },
  { customer: "Carlos Vega",   amount: "$6,150.00", city: "Mexico City, MX",  merchant: "Cantina Maraton"      },
  { customer: "Ingrid Borg",   amount: "$1,890.00", city: "Stockholm, SE",    merchant: "Nordic Auctions"      },
];

let templateIdx = 0;
let nextIdNumber = 2462; // CASE-2461 is Sarah; first new case will be CASE-2462

function buildCase(): Case {
  const t = NEW_CASE_TEMPLATES[templateIdx % NEW_CASE_TEMPLATES.length];
  templateIdx += 1;
  const id = `CASE-${nextIdNumber}`;
  nextIdNumber += 1;
  const initials = t.customer
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id,
    customer: t.customer,
    amount: t.amount,
    city: t.city,
    status: "investigating",
    priority: "high",
    unread: 1,
    when: "just now",
    customer_detail: {
      member_id: `m_${id.slice(-4)}`,
      name: t.customer,
      tier: "Premium",
      since: "—",
      email: `${t.customer.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: "+1 ··· ···· ····",
      initials,
    },
    transaction: {
      id: `txn_${id.slice(-4)}`,
      amount: t.amount,
      amount_usd: Number.parseFloat(t.amount.replace(/[$,]/g, "")) || 0,
      merchant: t.merchant,
      city: t.city,
      time: "just now",
    },
  };
}

function toListItem(c: Case): CaseListItem {
  return {
    id: c.id,
    customer: c.customer,
    amount: c.amount,
    city: c.city,
    status: c.status,
    priority: c.priority,
    unread: c.unread,
    when: c.when,
  };
}

export function listCases(): CaseListItem[] {
  return [...CASE_LIST];
}

export function getCaseDetail(id: string): Case | null {
  const stored = CASE_DETAILS.get(id);
  if (stored) return stored;
  const item = CASE_LIST.find((c) => c.id === id);
  return item ? caseStub(item) : null;
}

export function createCase(): Case {
  const c = buildCase();
  // New cases land at the top of the queue.
  CASE_LIST.unshift(toListItem(c));
  CASE_DETAILS.set(c.id, c);
  return c;
}

// ─── Resolved (analyst-Executed) state ─────────────────────────────────
const RESOLVED_META = new Map<string, SynthesisResolvedMeta>();
let nextDisputeNumber = 9921;

export function markResolved(id: string): SynthesisResolvedMeta | null {
  const detail = CASE_DETAILS.get(id) ?? null;
  const inList = CASE_LIST.some((c) => c.id === id);
  if (!detail && !inList) return null;

  const existing = RESOLVED_META.get(id);
  if (existing) {
    syncStatusToResolved(id);
    return existing;
  }

  const seed = Number.parseInt(id.replace(/\D/g, ""), 10) || 0;
  const ringId = String(140 + (seed % 60)).padStart(3, "0");
  const pattern =
    id === SARAH_CHEN.id ? "cluster_RING_142" : `cluster_RING_${ringId}`;
  const meta: SynthesisResolvedMeta = {
    dispute_id: `DSP-${nextDisputeNumber}`,
    pattern_saved: pattern,
  };
  nextDisputeNumber += 1;
  RESOLVED_META.set(id, meta);
  syncStatusToResolved(id);
  return meta;
}

export function getResolvedMeta(id: string): SynthesisResolvedMeta | null {
  return RESOLVED_META.get(id) ?? null;
}

function syncStatusToResolved(id: string) {
  const detail = CASE_DETAILS.get(id);
  if (detail) detail.status = "resolved";
  for (const item of CASE_LIST) {
    if (item.id === id) item.status = "resolved";
  }
}
