import type { Case } from "@/types/api";

// Full case detail for /api/cases/CASE-2461.
// Matches CASE_META in docs/design/reference-code/chat-data.jsx.
export const SARAH_CHEN: Case = {
  id: "CASE-2461",
  customer: "Sarah Chen",
  amount: "$4,280.00",
  city: "Bali, ID",
  status: "awaiting",
  priority: "high",
  unread: 3,
  when: "2m",

  customer_detail: {
    member_id: "m_8821",
    name: "Sarah Chen",
    tier: "Premium",
    since: "2018",
    email: "s.chen@example.com",
    phone: "+1 415 ··· 4019",
    initials: "SC",
  },

  transaction: {
    id: "txn_9F2A···4B",
    amount: "$4,280.00",
    amount_usd: 4280,
    merchant: "PT Sunset Holdings",
    city: "Bali, ID",
    time: "03:14:24 PT",
  },

  contact: 'Customer reached out via app: "I did not make this transaction. I am in San Francisco."',
};
