import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const seedPath = path.join(root, "data", "seed.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const count = Number(process.env.DEMO_TXN_COUNT || 10000);
const merchants = seed.merchants;
const customers = seed.customers;
const rows = [];

for (let i = 0; i < count; i++) {
  const customer = customers[i % customers.length];
  const merchant = merchants[(i * 7) % merchants.length];
  const amount = Math.round((customer.medianPayment * (0.3 + ((i * 17) % 80) / 10)) * 100) / 100;
  rows.push({
    id: `txn_bulk_${String(i + 1).padStart(7, "0")}`,
    customerId: customer.id,
    merchantId: merchant.id,
    amount,
    currency: "USD",
    status: merchant.riskScore > 80 && amount > customer.medianPayment * 4 ? "review" : "settled",
    occurredAt: new Date(Date.UTC(2026, 4, 12, 0, i % 60, i % 60)).toISOString()
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  transactions: rows
};

const outPath = path.join(root, "data", "generated-transactions.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Generated ${rows.length} transactions at ${outPath}`);

