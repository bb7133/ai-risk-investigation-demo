import type { Case, CaseListItem, TimelineEntry } from "@/types/api";

// Generates a minimal Case + thin timeline for any case in the sidebar
// other than Sarah Chen. Phase 1 keeps these light — header renders,
// conversation shows a single system event, and the right-panel
// Case-mode placeholders fill in the rest.

export function caseStub(listItem: CaseListItem): Case {
  const initials = listItem.customer
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    ...listItem,
    customer_detail: {
      member_id: `m_${listItem.id.slice(-4)}`,
      name: listItem.customer,
      tier: "Premium",
      since: "—",
      email: `${listItem.customer.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: "+1 ··· ···· ····",
      initials,
    },
    transaction: {
      id: `txn_${listItem.id.slice(-4)}`,
      amount: listItem.amount,
      amount_usd: Number.parseFloat(listItem.amount.replace(/[$,]/g, "")) || 0,
      merchant: "—",
      city: listItem.city,
      time: "—",
    },
    // No contact note for stubs.
  };
}

export function timelineStub(listItem: CaseListItem): TimelineEntry[] {
  return [
    {
      type: "system",
      ts: "—",
      text: `Case ${listItem.id} opened · auto-triage flagged ${listItem.priority.toUpperCase()} priority · agent investigation pending.`,
    },
  ];
}
