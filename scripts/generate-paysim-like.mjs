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
    cases.push({
      id: caseId,
      transaction_id: txId,
      priority: isFraud || isFlaggedFraud ? "P1" : "P2",
      status: "open",
      reason: isFraud
        ? "PaySim-style fraud pattern: account depletion via transfer or cash-out."
        : "High-risk merchant and amount significantly above customer baseline.",
      created_step: step
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

writeCsv("risk_cases.csv", ["id", "transaction_id", "priority", "status", "reason", "created_step"], cases);
writeCsv("network_edges.csv", ["case_id", "source", "target", "edge_type", "risk"], networkEdges);
writeCsv(
  "memory_events.csv",
  ["id", "subject_type", "subject_id", "event_type", "content", "confidence", "created_step"],
  memoryEvents
);

console.log(`Generated ${transactions.length} PaySim-style transactions`);
console.log(`Generated ${cases.length} risk cases`);
console.log(`Output: ${outDir}`);
