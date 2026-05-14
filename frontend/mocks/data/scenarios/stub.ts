import type { Case, Scenario, VerdictTone } from "@/types/api";

// Rich-but-narrative-only scenario for any non-Sarah case. Each agent
// emits a templated narrative + finding (no viz / no inspect, those
// stay Sarah's privilege). A synthesis card lands at the end in
// awaiting state — Execute remains a visual stub. Procedural variation
// (chargeback rate, ring id, score) is seeded off the case id so the
// same case replays identically.
//
// Total runtime ≈ 10s.
export function stubScenario(c: Case): Scenario {
  const name = c.customer_detail.name;
  const firstName = name.split(" ")[0];
  const amount = c.transaction.amount;
  const merchant = c.transaction.merchant;
  const city = c.transaction.city;
  const tier = c.customer_detail.tier;

  const seed = Number.parseInt(c.id.replace(/\D/g, ""), 10) || 0;
  const cbRate = (3 + (seed % 7) + (seed % 5) / 10).toFixed(1);
  const ringId = String(140 + (seed % 60)).padStart(3, "0");
  const confNum = 0.78 + (seed % 18) / 100;
  const conf = confNum.toFixed(2);
  const score = 72 + (seed % 25);
  const confidencePct = 0.85 + ((seed * 7) % 15) / 100;

  // Verdict tones derived from the seeded numbers — keeps the synthesis
  // card visually varied case-to-case.
  const merchantTone: VerdictTone = Number(cbRate) >= 5 ? "danger" : "warn";
  const merchantLevel = Number(cbRate) >= 5 ? "HIGH" : "ELEVATED";
  const networkTone: VerdictTone = confNum >= 0.85 ? "danger" : "warn";
  const networkLevel = confNum >= 0.85 ? "HIGH" : "MED";

  return [
    { delay: 0,   event: { type: "case_meta", case: c } },
    {
      delay: 200,
      event: {
        type: "system_event",
        entry: {
          type: "system",
          ts: c.transaction.time,
          text: `Case ${c.id} opened · auto-triage flagged ${c.priority.toUpperCase()} priority · 4 agents joined the channel.`,
        },
      },
    },

    // 4 agents come online.
    { delay: 300, event: { type: "agent_status", agent: "customer", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "merchant", status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "network",  status: "working" } },
    { delay: 60,  event: { type: "agent_status", agent: "policy",   status: "working" } },

    // Customer History reports first.
    {
      delay: 2200,
      event: {
        type: "agent_message",
        entry: {
          type: "agent",
          agent: "customer",
          ts: c.transaction.time,
          narrative: `Pulled ${firstName}'s recent transaction history. The ${amount} purchase falls outside their typical ticket pattern and the geography (${city}) is novel for this account. Treating this as a high-confidence anomaly.`,
          finding: `Anomaly · ${amount} novel geography (${city}).`,
        },
      },
    },
    { delay: 80, event: { type: "agent_status", agent: "customer", status: "done" } },

    // Merchant Analysis next.
    {
      delay: 1800,
      event: {
        type: "agent_message",
        entry: {
          type: "agent",
          agent: "merchant",
          ts: c.transaction.time,
          narrative: `Profiled the acceptor ${merchant}. 90-day chargeback rate is ${cbRate}%, above the industry baseline. Acquirer history shows recent friction. Recommending elevated review.`,
          finding: `Acceptor risk · ${cbRate}% chargeback rate · above baseline.`,
        },
      },
    },
    { delay: 80, event: { type: "agent_status", agent: "merchant", status: "done" } },

    // Network Graph cluster read.
    {
      delay: 1800,
      event: {
        type: "agent_message",
        entry: {
          type: "agent",
          agent: "network",
          ts: c.transaction.time,
          narrative: `Receiving account traces into cluster RING-${ringId} with confidence ${conf}. Prior victims show a ticket-size selectivity that matches ${firstName}'s ${amount}.`,
          finding: `Ring match · RING-${ringId} · conf ${conf}.`,
        },
      },
    },
    { delay: 80, event: { type: "agent_status", agent: "network", status: "done" } },

    // Policy Lookup closes the loop.
    {
      delay: 1500,
      event: {
        type: "agent_message",
        entry: {
          type: "agent",
          agent: "policy",
          ts: c.transaction.time,
          narrative: `Read facts from mem9 and matched against active policies. Reg E §1005.11 covers the unauthorized EFT path and Internal P-12 triggers an auto-hold given the ring match. ${tier} tier puts the provisional credit SLA at one hour.`,
          finding: `Auto-hold + ${amount} provisional credit eligible · ${tier} 1h SLA.`,
        },
      },
    },
    { delay: 80, event: { type: "agent_status", agent: "policy", status: "done" } },

    // Synthesis lands in awaiting state — no case_resolved follow-up
    // so the card stays interactive (Execute button visible).
    {
      delay: 1500,
      event: {
        type: "synthesis_ready",
        entry: {
          type: "synthesis",
          ts: c.transaction.time,
          score,
          confidence: confidencePct,
          verdicts: [
            { agent: "customer", label: "Anomaly",  level: "HIGH",        tone: "danger"      },
            { agent: "merchant", label: "Merchant", level: merchantLevel, tone: merchantTone  },
            { agent: "network",  label: "Network",  level: networkLevel,  tone: networkTone   },
            { agent: "policy",   label: "Policy",   level: "AUTO-HOLD",   tone: "warn"        },
          ],
          narrative: `Signals stack on ${firstName}'s ${amount} transaction at ${merchant}. ${tier} tier triggers the 1-hour provisional credit SLA under Reg E §1005.11 + Internal P-12.`,
          file: `recommended_action_${c.id}.md`,
          cited: [
            { f: `customer_pattern_${c.id}.md`, a: "customer" },
            { f: `merchant_risk_${c.id}.md`,    a: "merchant" },
            { f: `network_graph_${c.id}.json`,  a: "network"  },
            { f: `policy_match_${c.id}.md`,     a: "policy"   },
          ],
          actions: [
            { t: "Suspend card",             d: `${tier} cardholder · effective immediately` },
            { t: "Issue provisional credit", d: `${amount} · 1-hour SLA` },
            { t: "Open dispute case",        d: "Reg E §1005.11 · 10-day SLA" },
            { t: "Write pattern → mem9",     d: `cluster_RING_${ringId}` },
          ],
        },
      },
    },
  ];
}
