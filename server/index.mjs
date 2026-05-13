import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const guidedData = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
const policy = fs.readFileSync(path.join(root, "data", "policies", "fraud-policy.md"), "utf8");
let generatedDataCache = null;

const port = Number(process.env.PORT || 8787);
const tidbPool = process.env.DEMO_REPOSITORY === "tidb" ? await createTidbPool() : null;
const repositoryName = tidbPool ? "tidb" : "local-file";

async function createTidbPool() {
  const sslCa = process.env.TIDB_DEMO_SSL_CA && fs.existsSync(process.env.TIDB_DEMO_SSL_CA)
    ? fs.readFileSync(process.env.TIDB_DEMO_SSL_CA, "utf8")
    : undefined;
  return mysql.createPool({
    host: requiredEnv("TIDB_DEMO_HOST"),
    port: Number(process.env.TIDB_DEMO_PORT || 4000),
    user: requiredEnv("TIDB_DEMO_USER"),
    password: requiredEnv("TIDB_DEMO_PASSWORD"),
    database: requiredEnv("TIDB_DEMO_DATABASE"),
    ssl: sslCa ? { ca: sslCa } : {},
    waitForConnections: true,
    connectionLimit: 8,
    namedPlaceholders: true
  });
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env ${name}`);
  return value;
}

function json(res, status, body) {
  const bytes = Buffer.from(JSON.stringify(body, null, 2));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": bytes.length,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(bytes);
}

function notFound(res) {
  json(res, 404, { error: "not_found" });
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const columns = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(columns.map((column, index) => [column, values[index] || ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function readGeneratedData() {
  if (generatedDataCache) return generatedDataCache;
  const dir = path.join(root, "data", "paysim-like");
  const read = (fileName) => parseCsv(fs.readFileSync(path.join(dir, fileName), "utf8"));
  const transactions = read("transactions.csv");
  const cases = read("risk_cases.csv");
  const network = read("network_edges.csv");
  const memoryEvents = read("memory_events.csv");
  generatedDataCache = {
    transactions,
    cases,
    network,
    memoryEvents,
    transactionById: new Map(transactions.map((item) => [item.id, item])),
    riskCaseById: groupByOne(cases, (item) => item.id),
    networkByCase: groupBy(network, (item) => item.case_id),
    memoryBySubject: groupBy(memoryEvents, (item) => item.subject_id)
  };
  return generatedDataCache;
}

function groupBy(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    groups.set(key, [...(groups.get(key) || []), row]);
  }
  return groups;
}

function groupByOne(rows, keyFn) {
  return new Map(rows.map((row) => [keyFn(row), row]));
}

function countryFor(id) {
  const countries = ["KR", "JP", "SG", "US", "HK"];
  const n = Number(id.replace(/\D/g, "").slice(-6)) || 0;
  return countries[n % countries.length];
}

function generatedCaseBundle(caseId) {
  const generated = readGeneratedData();
  const riskCase = generated.riskCaseById.get(caseId);
  if (!riskCase) return null;
  const row = generated.transactionById.get(riskCase.transaction_id);
  if (!row) return null;

  const amount = Number(row.amount);
  const isFraud = row.isFraud === "1";
  const isFlagged = row.isFlaggedFraud === "1";
  const customerId = row.nameOrig;
  const merchantId = row.nameDest;
  const destinationIsMerchant = merchantId.startsWith("M");
  const medianRatio = isFraud ? 16 : riskCase.priority === "P1" ? 9 : riskCase.priority === "P2" ? 5 : 3;

  const transaction = {
    id: row.id,
    customerId,
    merchantId,
    amount,
    currency: "USD",
    status: riskCase.priority === "P1" ? "held" : "review",
    occurredAt: new Date(Date.UTC(2026, 4, 12, 0, Number(row.step || 0))).toISOString()
  };
  const customer = {
    id: customerId,
    name: `Client ${customerId.slice(-4)}`,
    riskTier: isFraud ? "watchlist" : riskCase.priority === "P1" ? "review" : "standard",
    country: countryFor(customerId),
    createdAt: "2025-01-01T00:00:00Z",
    medianPayment: Math.max(20, Math.round(amount / medianRatio))
  };
  const merchant = {
    id: merchantId,
    name: destinationIsMerchant ? `Merchant ${merchantId.slice(-4)}` : `Beneficiary ${merchantId.slice(-4)}`,
    category: destinationIsMerchant ? "merchant payment" : row.type.toLowerCase().replaceAll("_", " "),
    country: countryFor(merchantId),
    riskScore: isFraud ? 93 : isFlagged ? 88 : riskCase.priority === "P1" ? 84 : riskCase.priority === "P2" ? 68 : 43
  };
  const riskCaseDto = {
    id: riskCase.id,
    transactionId: riskCase.transaction_id,
    priority: riskCase.priority,
    status: riskCase.status,
    reason: riskCase.reason,
    createdAt: transaction.occurredAt
  };
  const graph = (generated.networkByCase.get(caseId) || []).map((edge) => ({
    source: edge.source,
    target: edge.target,
    type: edge.edge_type,
    risk: Number(edge.risk)
  }));
  const evidence = graph.length
    ? graph.map((edge, index) => ({
        id: `${caseId}_ev_${index + 1}`,
        caseId,
        kind: edge.type,
        title: edge.type.replaceAll("_", " "),
        uri: `tidb://evidence/${caseId}/${edge.type}`,
        summary: `${edge.source} -> ${edge.target}, risk ${edge.risk}.`
      }))
    : [
        {
          id: `${caseId}_ev_1`,
          caseId,
          kind: "transaction",
          title: "Risk engine signal",
          uri: `tidb://evidence/${caseId}/transaction`,
          summary: riskCase.reason
        }
      ];
  const memory = [
    ...(generated.memoryBySubject.get(customer.id) || []),
    ...(generated.memoryBySubject.get(merchant.id) || [])
  ].map((item) => ({
    id: item.id,
    subjectType: item.subject_type,
    subjectId: item.subject_id,
    eventType: item.event_type,
    content: item.content,
    confidence: Number(item.confidence),
    createdAt: new Date(Date.UTC(2026, 4, 12, 0, Number(item.created_step || 0))).toISOString()
  }));

  return { source: "generated", case: riskCaseDto, transaction, customer, merchant, evidence, memory, graph };
}

function guidedCaseBundle(caseId) {
  const riskCase = guidedData.cases.find((item) => item.id === caseId);
  if (!riskCase) return null;
  const transaction = guidedData.transactions.find((item) => item.id === riskCase.transactionId);
  const customer = guidedData.customers.find((item) => item.id === transaction.customerId);
  const merchant = guidedData.merchants.find((item) => item.id === transaction.merchantId);
  const evidence = guidedData.evidence.filter((item) => item.caseId === riskCase.id);
  const memory = guidedData.memoryEvents.filter((item) =>
    [customer.id, merchant.id].includes(item.subjectId)
  );
  const graph = guidedData.network.filter((edge) =>
    [customer.id, merchant.id].includes(edge.source) ||
    [customer.id, merchant.id].includes(edge.target) ||
    evidence.some((item) => edge.source.includes(item.id) || edge.target.includes(item.id))
  );
  return { source: "guided", case: riskCase, transaction, customer, merchant, evidence, memory, graph };
}

function caseBundle(caseId) {
  return guidedCaseBundle(caseId) || generatedCaseBundle(caseId);
}

function caseRow(bundle) {
  return {
    ...bundle.case,
    customer: bundle.customer.name,
    merchant: bundle.merchant.name,
    amount: bundle.transaction.amount,
    currency: bundle.transaction.currency,
    merchantRisk: bundle.merchant.riskScore,
    source: bundle.source
  };
}

function listGuidedCases({ priority, query }) {
  return guidedData.cases
    .map((riskCase) => caseRow(guidedCaseBundle(riskCase.id)))
    .filter((row) => filterCase(row, priority, query));
}

function listGeneratedCases({ priority, query }) {
  const generated = readGeneratedData();
  return generated.cases
    .map((riskCase) => caseRow(generatedCaseBundle(riskCase.id)))
    .filter((row) => filterCase(row, priority, query));
}

async function listCases({ source, priority, query, limit }) {
  if (tidbPool) return listTidbCases({ source, priority, query, limit });
  const rows = source === "generated"
    ? listGeneratedCases({ priority, query })
    : listGuidedCases({ priority, query });
  return {
    source,
    repository: repositoryName,
    total: rows.length,
    cases: rows.slice(0, limit)
  };
}

async function listTidbCases({ source, priority, query, limit }) {
  const clauses = ["rc.source = :source"];
  const params = {
    source,
    limit: Number(limit)
  };
  if (priority !== "all") {
    clauses.push("rc.priority = :priority");
    params.priority = priority;
  }
  const q = query.trim();
  if (q) {
    clauses.push("(rc.id LIKE :q OR rc.transaction_id LIKE :q OR c.name LIKE :q OR m.name LIKE :q OR rc.reason LIKE :q)");
    params.q = `%${q}%`;
  }
  const [rows] = await tidbPool.query(
    `
      SELECT
        rc.id,
        rc.transaction_id AS transactionId,
        rc.priority,
        rc.status,
        rc.reason,
        rc.created_at AS createdAt,
        c.name AS customer,
        m.name AS merchant,
        CAST(t.amount AS DOUBLE) AS amount,
        t.currency,
        m.risk_score AS merchantRisk,
        rc.source
      FROM risk_cases rc
      JOIN transactions t ON t.id = rc.transaction_id
      JOIN customers c ON c.id = t.customer_id
      JOIN merchants m ON m.id = t.merchant_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY CASE rc.priority WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END, rc.created_at DESC
      LIMIT :limit
    `,
    params
  );
  const [[{ total }]] = await tidbPool.query(
    `
      SELECT COUNT(*) AS total
      FROM risk_cases rc
      JOIN transactions t ON t.id = rc.transaction_id
      JOIN customers c ON c.id = t.customer_id
      JOIN merchants m ON m.id = t.merchant_id
      WHERE ${clauses.join(" AND ")}
    `,
    params
  );
  return {
    source,
    repository: repositoryName,
    total: Number(total),
    cases: rows.map(normalizeCaseRow)
  };
}

function normalizeCaseRow(row) {
  return {
    ...row,
    createdAt: formatDate(row.createdAt),
    amount: Number(row.amount),
    merchantRisk: Number(row.merchantRisk)
  };
}

async function getCaseBundle(caseId) {
  if (tidbPool) return getTidbCaseBundle(caseId);
  return caseBundle(caseId);
}

async function getTidbCaseBundle(caseId) {
  const [rows] = await tidbPool.query(
    `
      SELECT
        rc.id AS caseId,
        rc.source,
        rc.transaction_id AS transactionId,
        rc.priority,
        rc.status AS caseStatus,
        rc.reason,
        rc.created_at AS caseCreatedAt,
        t.id AS txId,
        t.customer_id AS customerId,
        t.merchant_id AS merchantId,
        CAST(t.amount AS DOUBLE) AS amount,
        t.currency,
        t.status AS txStatus,
        t.occurred_at AS occurredAt,
        c.name AS customerName,
        c.risk_tier AS riskTier,
        c.country AS customerCountry,
        c.created_at AS customerCreatedAt,
        CAST(c.median_payment AS DOUBLE) AS medianPayment,
        m.name AS merchantName,
        m.category AS merchantCategory,
        m.country AS merchantCountry,
        m.risk_score AS merchantRisk
      FROM risk_cases rc
      JOIN transactions t ON t.id = rc.transaction_id
      JOIN customers c ON c.id = t.customer_id
      JOIN merchants m ON m.id = t.merchant_id
      WHERE rc.id = :caseId
    `,
    { caseId }
  );
  const row = rows[0];
  if (!row) return null;

  const [evidenceRows] = await tidbPool.query(
    "SELECT id, case_id AS caseId, kind, title, uri, summary FROM evidence_files WHERE case_id = :caseId ORDER BY id",
    { caseId }
  );
  const [graphRows] = await tidbPool.query(
    "SELECT source, target, edge_type AS type, risk FROM network_edges WHERE case_id = :caseId ORDER BY risk DESC",
    { caseId }
  );
  const [memoryRows] = await tidbPool.query(
    `
      SELECT id, subject_type AS subjectType, subject_id AS subjectId, event_type AS eventType, content, CAST(confidence AS DOUBLE) AS confidence, created_at AS createdAt
      FROM memory_events
      WHERE (subject_type = 'customer' AND subject_id = :customerId)
         OR (subject_type = 'merchant' AND subject_id = :merchantId)
      ORDER BY confidence DESC, created_at DESC
    `,
    { customerId: row.customerId, merchantId: row.merchantId }
  );

  return {
    source: row.source,
    case: {
      id: row.caseId,
      transactionId: row.transactionId,
      priority: row.priority,
      status: row.caseStatus,
      reason: row.reason,
      createdAt: formatDate(row.caseCreatedAt)
    },
    transaction: {
      id: row.txId,
      customerId: row.customerId,
      merchantId: row.merchantId,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.txStatus,
      occurredAt: formatDate(row.occurredAt)
    },
    customer: {
      id: row.customerId,
      name: row.customerName,
      riskTier: row.riskTier,
      country: row.customerCountry,
      createdAt: formatDate(row.customerCreatedAt),
      medianPayment: Number(row.medianPayment)
    },
    merchant: {
      id: row.merchantId,
      name: row.merchantName,
      category: row.merchantCategory,
      country: row.merchantCountry,
      riskScore: Number(row.merchantRisk)
    },
    evidence: evidenceRows,
    memory: memoryRows.map((item) => ({ ...item, createdAt: formatDate(item.createdAt), confidence: Number(item.confidence) })),
    graph: graphRows.map((item) => ({ ...item, risk: Number(item.risk) }))
  };
}

function formatDate(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  return String(value).replace(" ", "T").replace(/(\.\d+)?$/, "Z");
}

function filterCase(row, priority, query) {
  const priorityOk = priority === "all" || row.priority === priority;
  const q = query.trim().toLowerCase();
  const queryOk =
    q.length === 0 ||
    [row.id, row.transactionId, row.customer, row.merchant, row.reason]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  return priorityOk && queryOk;
}

function analyze(bundle) {
  const { transaction, customer, merchant, evidence, memory, graph } = bundle;
  const amountRatio = transaction.amount / customer.medianPayment;
  const highRiskEdges = graph.filter((edge) => edge.risk >= 80);
  const score = Math.min(
    99,
    Math.round(
      merchant.riskScore * 0.42 +
        Math.min(40, amountRatio * 6) +
        highRiskEdges.length * 9 +
        memory.length * 7 +
        evidence.length * 5
    )
  );

  const recommendation =
    score >= 85
      ? "Escalate to fraud operations, keep payment held, and request merchant payout review."
      : score >= 65
        ? "Keep a conditional hold and request customer confirmation before release."
        : "Release after standard monitoring.";

  return {
    score,
    conclusion:
      score >= 85
        ? "Likely coordinated fraud or mule-network activity."
        : score >= 65
          ? "Suspicious but not conclusive."
          : "Low-confidence alert.",
    recommendation,
    agents: [
      {
        name: "Customer History Agent",
        status: "complete",
        finding: `${customer.name} is ${customer.riskTier}; transaction is ${amountRatio.toFixed(1)}x the customer's normal median payment.`,
        confidence: amountRatio > 4 ? 0.86 : 0.62,
        reads: ["customers", "transactions", "memory_events"],
        writes: ["agent_findings"],
        steps: [
          `Loaded customer profile for ${customer.id}.`,
          `Compared transaction amount ${transaction.currency} ${transaction.amount} against median ${transaction.currency} ${customer.medianPayment}.`,
          `Recalled ${memory.filter((item) => item.subjectId === customer.id).length} customer memory event(s).`
        ],
        evidence: [
          `amount_ratio=${amountRatio.toFixed(1)}x`,
          `risk_tier=${customer.riskTier}`
        ],
        sql: `SELECT * FROM customers WHERE id='${customer.id}';`
      },
      {
        name: "Merchant Risk Agent",
        status: "complete",
        finding: `${merchant.name} has merchant risk score ${merchant.riskScore} in ${merchant.category}.`,
        confidence: merchant.riskScore >= 80 ? 0.9 : 0.66,
        reads: ["merchants", "memory_events"],
        writes: ["agent_findings"],
        steps: [
          `Loaded merchant profile for ${merchant.id}.`,
          `Checked merchant risk score and category.`,
          `Recalled ${memory.filter((item) => item.subjectId === merchant.id).length} merchant memory event(s).`
        ],
        evidence: [
          `merchant_risk_score=${merchant.riskScore}`,
          `category=${merchant.category}`
        ],
        sql: `SELECT * FROM merchants WHERE id='${merchant.id}';`
      },
      {
        name: "Network Graph Agent",
        status: "complete",
        finding: `${highRiskEdges.length} high-risk graph edges found around customer, device, payout account, or merchant.`,
        confidence: highRiskEdges.length > 0 ? 0.88 : 0.54,
        reads: ["network_edges", "evidence_files"],
        writes: ["agent_findings"],
        steps: [
          `Built focused ego graph for case ${bundle.case.id}.`,
          `Scanned ${graph.length} graph edge(s).`,
          `Flagged ${highRiskEdges.length} edge(s) with risk >= 80.`
        ],
        evidence: highRiskEdges.map((edge) => `${edge.source} -> ${edge.target} (${edge.type}, risk ${edge.risk})`),
        sql: `SELECT * FROM network_edges WHERE case_id='${bundle.case.id}' ORDER BY risk DESC;`
      },
      {
        name: "Policy Agent",
        status: "complete",
        finding:
          merchant.riskScore >= 80 || amountRatio > 4
            ? "Policy says this case qualifies for escalation or conditional hold."
            : "Policy allows release if no additional graph evidence is found.",
        confidence: 0.82,
        reads: ["policy_documents", "risk_cases"],
        writes: ["agent_findings"],
        steps: [
          "Loaded payment risk policy extract.",
          "Matched case facts against escalation and conditional-hold rules.",
          "Prepared action recommendation for human review."
        ],
        evidence: merchant.riskScore >= 80 || amountRatio > 4
          ? ["Immediate Escalation: high-risk merchant or abnormal amount"]
          : ["Release: no high-risk graph or merchant signal"],
        sql: `SELECT reason, priority FROM risk_cases WHERE id='${bundle.case.id}';`
      },
      {
        name: "Memory Agent",
        status: "complete",
        finding:
          memory.length > 0
            ? `Found ${memory.length} prior memory event(s) linked to this customer or merchant.`
            : "No prior memory events linked to this customer or merchant.",
        confidence: memory.length > 0 ? 0.86 : 0.58,
        reads: ["memory_events"],
        writes: ["memory_events", "agent_findings"],
        steps: [
          `Searched memory by customer ${customer.id} and merchant ${merchant.id}.`,
          `Ranked ${memory.length} matching memory event(s) by confidence.`,
          "Prepared new investigation summary for future recall."
        ],
        evidence: memory.map((item) => `${item.eventType}: ${item.content}`),
        sql: `SELECT * FROM memory_events WHERE (subject_type, subject_id) IN (('customer','${customer.id}'),('merchant','${merchant.id}'));`
      }
    ],
    policyExcerpt: policy.split("\n").slice(0, 18).join("\n")
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "risk-investigation-api", repository: repositoryName });
    }

    if (req.method === "GET" && url.pathname === "/api/cases") {
      const source = url.searchParams.get("source") || "guided";
      const priority = url.searchParams.get("priority") || "all";
      const query = url.searchParams.get("q") || "";
      const limit = Math.min(Number(url.searchParams.get("limit") || 250), 2000);
      return json(res, 200, await listCases({ source, priority, query, limit }));
    }

    const caseMatch = url.pathname.match(/^\/api\/cases\/([^/]+)$/);
    if (req.method === "GET" && caseMatch) {
      const bundle = await getCaseBundle(caseMatch[1]);
      return bundle ? json(res, 200, bundle) : notFound(res);
    }

    const investigationMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/investigate$/);
    if (req.method === "POST" && investigationMatch) {
      const bundle = await getCaseBundle(investigationMatch[1]);
      return bundle ? json(res, 200, { ...bundle, analysis: analyze(bundle) }) : notFound(res);
    }

    if (req.method === "GET" && url.pathname === "/api/schema") {
      const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
      const schema = readme.match(/```sql\n([\s\S]*?)```/)?.[1] || "";
      return json(res, 200, { schema });
    }

    notFound(res);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "internal_error", message: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Risk investigation API listening on http://127.0.0.1:${port} (${repositoryName})`);
});
