import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "paysim-like");
fs.mkdirSync(outDir, { recursive: true });

const count = Number(process.env.DEMO_TXN_COUNT || 100000);
const nbClients = Number(process.env.DEMO_CLIENTS || 20000);
const nbMerchants = Number(process.env.DEMO_MERCHANTS || 5000);
const fraudRate = Number(process.env.DEMO_FRAUD_RATE || 0.0015);
const flaggedLimit = Number(process.env.DEMO_FLAGGED_LIMIT || 200000);

const txTypes = ["PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN", "DEBIT"];
const typeWeights = [56, 17, 16, 8, 3];
const riskyMerchantEvery = 37;
const fraudsterEvery = Math.max(10, Math.floor(1 / fraudRate));

function pickWeighted(items, weights, n) {
  const total = weights.reduce((sum, item) => sum + item, 0);
  let mark = n % total;
  for (let i = 0; i < items.length; i++) {
    mark -= weights[i];
    if (mark < 0) return items[i];
  }
  return items[0];
}

function money(value) {
  return Math.max(0, Math.round(value * 100) / 100).toFixed(2);
}

function csvEscape(value) {
  const text = String(value);
  return /[,"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(fileName, columns, rows) {
  const content = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))
  ].join("\n");
  fs.writeFileSync(path.join(outDir, fileName), `${content}\n`);
}

const customers = Array.from({ length: nbClients }, (_, index) => {
  const id = `C${String(index + 1).padStart(9, "0")}`;
  return {
    id,
    baseline: 100 + ((index * 17) % 900),
    balance: 250 + ((index * 7919) % 50000),
    country: ["KR", "JP", "SG", "US", "HK"][index % 5],
    fraudster: index % fraudsterEvery === 0
  };
});

const merchants = Array.from({ length: nbMerchants }, (_, index) => {
  const id = `M${String(index + 1).padStart(8, "0")}`;
  const risky = index % riskyMerchantEvery === 0;
  return {
    id,
    balance: 1000 + ((index * 3571) % 200000),
    riskScore: risky ? 82 + (index % 18) : 12 + (index % 48),
    risky
  };
});

const transactions = [];
const cases = [];
const networkEdges = [];
const memoryEvents = [];
const timelineEvents = [];
const agentStatuses = [];
const syntheses = [];
const caseActions = [];

for (let i = 0; i < count; i++) {
  const step = 1 + (i % 744);
  const origin = customers[(i * 13) % customers.length];
  const merchant = merchants[(i * 19) % merchants.length];
  const type = pickWeighted(txTypes, typeWeights, i * 7);
  const fraudPattern = origin.fraudster && (type === "TRANSFER" || type === "CASH_OUT");
  const riskyBurst = merchant.risky && i % 11 === 0;
  const amountMultiplier = fraudPattern ? 18 + (i % 12) : riskyBurst ? 6 + (i % 5) : 0.2 + ((i * 31) % 55) / 10;
  const amount = origin.baseline * amountMultiplier;
  const destinationCustomer = customers[(i * 29 + 17) % customers.length];
  const destination = type === "PAYMENT" || type === "DEBIT" ? merchant : destinationCustomer;

  const oldbalanceOrg = origin.balance;
  const newbalanceOrig = type === "CASH_IN" ? origin.balance + amount : origin.balance - Math.min(origin.balance, amount);
  const oldbalanceDest = destination.balance || 0;
  const newbalanceDest = type === "CASH_OUT" ? oldbalanceDest : oldbalanceDest + amount;
  origin.balance = newbalanceOrig;
  destination.balance = newbalanceDest;

  const isFraud = fraudPattern || (riskyBurst && amount > origin.baseline * 7);
  const isFlaggedFraud = amount > flaggedLimit && (type === "TRANSFER" || type === "CASH_OUT");
  const txId = `TX${String(i + 1).padStart(10, "0")}`;

  transactions.push({
    id: txId,
    step,
    type,
    amount: money(amount),
    nameOrig: origin.id,
    oldbalanceOrg: money(oldbalanceOrg),
    newbalanceOrig: money(newbalanceOrig),
    nameDest: destination.id,
    oldbalanceDest: money(oldbalanceDest),
    newbalanceDest: money(newbalanceDest),
    isFraud: isFraud ? 1 : 0,
    isFlaggedFraud: isFlaggedFraud ? 1 : 0
  });

  if (isFraud || isFlaggedFraud || (merchant.risky && amount > origin.baseline * 4)) {
    const caseId = `RC${String(cases.length + 1).padStart(8, "0")}`;
    const priority = isFraud || isFlaggedFraud ? "P1" : "P2";
    const reason = isFraud
      ? "PaySim-style fraud pattern: account depletion via transfer or cash-out."
      : "High-risk merchant and amount significantly above customer baseline.";
    const unread = priority === "P1" ? 3 : 1;
    const contact = isFraud
      ? "Customer confirmation required: transaction pattern matches account-depletion behavior."
      : "Risk operations review requested for elevated merchant and amount pattern.";
    cases.push({
      id: caseId,
      transaction_id: txId,
      priority,
      status: "awaiting",
      reason,
      created_step: step,
      unread,
      contact
    });

    const deviceId = `D${String(((i * 97) % 50000) + 1).padStart(8, "0")}`;
    const payoutId = `A${String(((i * 43) % 12000) + 1).padStart(8, "0")}`;
    networkEdges.push(
      { case_id: caseId, source: origin.id, target: deviceId, edge_type: "uses_device", risk: isFraud ? 90 : 64 },
      { case_id: caseId, source: deviceId, target: payoutId, edge_type: "linked_payout_account", risk: isFraud ? 92 : 70 },
      { case_id: caseId, source: payoutId, target: destination.id, edge_type: "pays_to", risk: merchant.risky ? 88 : 62 }
    );

    memoryEvents.push({
      id: `ME${String(memoryEvents.length + 1).padStart(8, "0")}`,
      subject_type: destination.id.startsWith("M") ? "merchant" : "customer",
      subject_id: destination.id,
      event_type: isFraud ? "prior_fraud_pattern" : "risk_signal",
      content: isFraud
        ? "Entity appears in a PaySim-style fraudulent transfer/cash-out chain."
        : "Entity is connected to an elevated-risk payment flow.",
      confidence: isFraud ? "0.9100" : "0.7300",
      created_step: step
    });

    const workflow = workflowRows({
      caseId,
      txId,
      step,
      priority,
      reason,
      originId: origin.id,
      destinationId: destination.id,
      amount: money(amount),
      type,
      isFraud,
      isFlaggedFraud,
      merchantRisk: merchant.riskScore,
      edgeRisk: isFraud ? 92 : 70
    });
    timelineEvents.push(...workflow.timelineEvents);
    agentStatuses.push(...workflow.agentStatuses);
    syntheses.push(workflow.synthesis);
    caseActions.push(...workflow.caseActions);
  }
}

writeCsv(
  "transactions.csv",
  [
    "id",
    "step",
    "type",
    "amount",
    "nameOrig",
    "oldbalanceOrg",
    "newbalanceOrig",
    "nameDest",
    "oldbalanceDest",
    "newbalanceDest",
    "isFraud",
    "isFlaggedFraud"
  ],
  transactions
);

writeCsv("risk_cases.csv", ["id", "transaction_id", "priority", "status", "reason", "created_step", "unread", "contact"], cases);
writeCsv("network_edges.csv", ["case_id", "source", "target", "edge_type", "risk"], networkEdges);
writeCsv(
  "memory_events.csv",
  ["id", "subject_type", "subject_id", "event_type", "content", "confidence", "created_step"],
  memoryEvents
);
writeCsv(
  "case_timeline_events.csv",
  ["case_id", "event_order", "event_type", "agent_id", "ts_label", "payload_json", "created_step"],
  timelineEvents
);
writeCsv("case_agent_status.csv", ["case_id", "agent_id", "status"], agentStatuses);
writeCsv(
  "case_synthesis.csv",
  ["case_id", "score", "confidence", "narrative", "payload_json", "resolved_payload_json"],
  syntheses
);
writeCsv("case_actions.csv", ["case_id", "action_type", "action_detail", "status"], caseActions);

console.log(`Generated ${transactions.length} PaySim-style transactions`);
console.log(`Generated ${cases.length} risk cases`);
console.log(`Generated ${timelineEvents.length} workflow timeline events`);
console.log(`Output: ${outDir}`);

function workflowRows({
  caseId,
  txId,
  step,
  priority,
  reason,
  originId,
  destinationId,
  amount,
  type,
  isFraud,
  isFlaggedFraud,
  merchantRisk,
  edgeRisk
}) {
  const amountNumber = Number(amount);
  const score = Math.min(
    99,
    Math.round(
      (priority === "P1" ? 58 : 38) +
        Math.min(20, amountNumber / 800) +
        Math.min(15, merchantRisk / 7) +
        (isFraud ? 15 : 0) +
        (isFlaggedFraud ? 8 : 0)
    )
  );
  const confidence = score >= 85 ? "0.9100" : "0.7800";
  const ringId = String(140 + (Number(caseId.replace(/\D/g, "")) % 60)).padStart(3, "0");
  const timeline = [
    {
      event_type: "system_event",
      agent_id: "",
      ts_label: "T+0s",
      payload: {
        type: "system",
        ts: "T+0s",
        text: `Case ${caseId} opened from transaction ${txId}; ${priority} priority.`
      }
    },
    {
      event_type: "agent_message",
      agent_id: "customer",
      ts_label: "T+2s",
      payload: {
        type: "agent",
        agent: "customer",
        ts: "T+2s",
        narrative: `${originId} generated a ${type} transaction for USD ${amount}. The amount and flow shape are outside the normal synthetic baseline.`,
        finding: `Customer anomaly: ${type} amount USD ${amount}.`
      }
    },
    {
      event_type: "agent_message",
      agent_id: "merchant",
      ts_label: "T+4s",
      payload: {
        type: "agent",
        agent: "merchant",
        ts: "T+4s",
        narrative: `${destinationId} has risk score ${merchantRisk}; the transaction matches an elevated merchant or payout pattern.`,
        finding: `Merchant or beneficiary risk score ${merchantRisk}.`
      }
    },
    {
      event_type: "agent_message",
      agent_id: "network",
      ts_label: "T+6s",
      payload: {
        type: "agent",
        agent: "network",
        ts: "T+6s",
        narrative: `The case graph links customer, device, payout account, and receiver with max edge risk ${edgeRisk}.`,
        finding: `Graph risk edge observed; cluster RING-${ringId}.`
      }
    },
    {
      event_type: "agent_message",
      agent_id: "policy",
      ts_label: "T+8s",
      payload: {
        type: "agent",
        agent: "policy",
        ts: "T+8s",
        narrative: score >= 85
          ? "Policy match recommends hold, escalation, and dispute workflow."
          : "Policy match recommends conditional review before release.",
        finding: score >= 85 ? "Auto-hold and fraud-ops escalation." : "Conditional manual review."
      }
    },
    {
      event_type: "synthesis_ready",
      agent_id: "",
      ts_label: "T+10s",
      payload: {
        type: "synthesis",
        ts: "T+10s",
        score,
        confidence: Number(confidence),
        verdicts: [
          { agent: "customer", label: "Anomaly", level: priority === "P1" ? "HIGH" : "MED", tone: priority === "P1" ? "danger" : "warn" },
          { agent: "merchant", label: "Merchant", level: merchantRisk >= 80 ? "HIGH" : "MED", tone: merchantRisk >= 80 ? "danger" : "warn" },
          { agent: "network", label: "Network", level: edgeRisk >= 80 ? "HIGH" : "MED", tone: edgeRisk >= 80 ? "danger" : "warn" },
          { agent: "policy", label: "Policy", level: score >= 85 ? "AUTO-HOLD" : "REVIEW", tone: "warn" }
        ],
        narrative: score >= 85
          ? `High-confidence fraud investigation for ${caseId}; keep the transaction held and open dispute workflow.`
          : `Elevated-risk investigation for ${caseId}; keep under review pending confirmation.`,
        file: `recommended_action_${caseId}.md`,
        cited: [
          { f: `customer_pattern_${caseId}.md`, a: "customer" },
          { f: `merchant_risk_${caseId}.md`, a: "merchant" },
          { f: `network_graph_${caseId}.json`, a: "network" },
          { f: `policy_match_${caseId}.md`, a: "policy" }
        ],
        actions: actionPayloads(score, amount, ringId)
      }
    }
  ];
  const agentStatuses = ["customer", "merchant", "network", "policy"].map((agent) => ({
    case_id: caseId,
    agent_id: agent,
    status: "done"
  }));
  const narrative = score >= 85
    ? `High-confidence fraud investigation for ${caseId}; keep the transaction held and open dispute workflow.`
    : `Elevated-risk investigation for ${caseId}; keep under review pending confirmation.`;
  return {
    timelineEvents: timeline.map((entry, index) => ({
      case_id: caseId,
      event_order: index + 1,
      event_type: entry.event_type,
      agent_id: entry.agent_id,
      ts_label: entry.ts_label,
      payload_json: JSON.stringify(entry.payload),
      created_step: step
    })),
    agentStatuses,
    synthesis: {
      case_id: caseId,
      score,
      confidence,
      narrative,
      payload_json: JSON.stringify({ score, confidence: Number(confidence), ring: `RING-${ringId}`, reason }),
      resolved_payload_json: ""
    },
    caseActions: actionPayloads(score, amount, ringId).map((action) => ({
      case_id: caseId,
      action_type: action.t,
      action_detail: action.d,
      status: "recommended"
    }))
  };
}

function actionPayloads(score, amount, ringId) {
  if (score >= 85) {
    return [
      { t: "Hold transaction", d: `Keep USD ${amount} held pending fraud-ops review.` },
      { t: "Open dispute case", d: "Start customer-confirmation and dispute workflow." },
      { t: "Write pattern memory", d: `Persist cluster_RING_${ringId} as a future recall signal.` }
    ];
  }
  return [
    { t: "Manual review", d: `Review USD ${amount} transaction before release.` },
    { t: "Write risk note", d: `Persist cluster_RING_${ringId} as an elevated-risk signal.` }
  ];
}
