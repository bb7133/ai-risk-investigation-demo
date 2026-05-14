import type { CaseListItem } from "@/types/api";

// Sidebar list — Tier 2 ("Awaiting my review · High priority") only.
// Order and field values match docs/design/mockups/01-case-default-resolved.png.
export const CASES: CaseListItem[] = [
  { id: "CASE-2461", customer: "Sarah Chen",    amount: "$4,280.00",  city: "Bali, ID",         status: "awaiting", priority: "high", unread: 3, when: "2m"     },
  { id: "CASE-2458", customer: "Lucia Mendoza", amount: "$3,400.00",  city: "São Paulo, BR",    status: "awaiting", priority: "high", unread: 1, when: "11m"    },
  { id: "CASE-2454", customer: "Anika Patel",   amount: "$3,100.00",  city: "Buenos Aires, AR", status: "awaiting", priority: "high", unread: 1, when: "21m"    },
  { id: "CASE-2451", customer: "Mohamed Saleh", amount: "$5,980.00",  city: "Dubai, AE",        status: "awaiting", priority: "high", unread: 2, when: "47m"    },
  { id: "CASE-2446", customer: "Hiro Sato",     amount: "$6,210.00",  city: "Bangkok, TH",      status: "awaiting", priority: "high", unread: 1, when: "1h 14m" },
  { id: "CASE-2444", customer: "Selin Demir",   amount: "$7,820.00",  city: "Istanbul, TR",     status: "awaiting", priority: "high", unread: 1, when: "1h 29m" },
  { id: "CASE-2441", customer: "Olivia Reed",   amount: "$5,140.00",  city: "Cape Town, ZA",    status: "awaiting", priority: "high", unread: 1, when: "1h 50m" },
  { id: "CASE-2439", customer: "Sofia Russo",   amount: "$4,890.00",  city: "Rome, IT",         status: "awaiting", priority: "high", unread: 2, when: "2h 04m" },
  { id: "CASE-2437", customer: "Mei Ling",      amount: "$8,400.00",  city: "Singapore, SG",    status: "awaiting", priority: "high", unread: 1, when: "2h 19m" },
  { id: "CASE-2434", customer: "Felix Wagner",  amount: "$2,470.00",  city: "Vienna, AT",       status: "awaiting", priority: "high", unread: 1, when: "2h 41m" },
  { id: "CASE-2431", customer: "Arjun Khanna",  amount: "$11,200.00", city: "Delhi, IN",        status: "awaiting", priority: "high", unread: 1, when: "3h 02m" },
];

// Sidebar filter header — "Awaiting my review · High priority" + "11" + red "15".
// 11 = count of cases above. 15 = unread tally across the high-priority queue;
// the visible 11 rows sum to 15.
export const SIDEBAR_FILTER_COUNTS = {
  awaiting: CASES.length, // 11
  high_priority_unread: CASES.reduce((s, c) => s + c.unread, 0), // 15
} as const;
