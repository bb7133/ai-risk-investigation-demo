import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
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
const agentProvider = (process.env.RISK_AGENT_PROVIDER || (process.env.OPENAI_API_KEY ? "openai" : "deterministic")).toLowerCase();
const agentModel = process.env.RISK_AGENT_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
const agentBaseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const agentTimeoutMs = Number(process.env.RISK_AGENT_TIMEOUT_MS || 25000);
const codexBin = process.env.RISK_CODEX_BIN || "/opt/homebrew/bin/codex";
const codexModel = process.env.RISK_CODEX_MODEL || "";

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

function isCodexProvider() {
  return agentProvider === "codex" || agentProvider === "codex-cli";
}

function activeAgentRuntime() {
  if (isCodexProvider()) return "codex-cli";
  if (agentProvider === "openai" && process.env.OPENAI_API_KEY) return "openai";
  return "deterministic-fallback";
}

function activeAgentModel() {
  if (isCodexProvider()) return codexModel || "codex-default";
  if (agentProvider === "openai" && process.env.OPENAI_API_KEY) return agentModel;
  return "local-skill-fallback";
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

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
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
        rc.unread,
        rc.contact,
        rc.created_at AS createdAt,
        c.name AS customer,
        m.name AS merchant,
        m.city,
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

async function getCaseTimeline(caseId) {
  const bundle = await getCaseBundle(caseId);
  return bundle ? await buildAgentTimeline(bundle) : [];
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
        rc.unread,
        rc.contact,
        rc.resolved_at AS resolvedAt,
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
        c.email,
        c.phone,
        c.initials,
        c.member_since AS memberSince,
        c.tier,
        m.name AS merchantName,
        m.category AS merchantCategory,
        m.country AS merchantCountry,
        m.city AS merchantCity,
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
      createdAt: formatDate(row.caseCreatedAt),
      unread: Number(row.unread || 0),
      contact: row.contact,
      resolvedAt: formatDate(row.resolvedAt)
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
      medianPayment: Number(row.medianPayment),
      email: row.email,
      phone: row.phone,
      initials: row.initials,
      memberSince: formatDate(row.memberSince)?.slice(0, 10),
      tier: row.tier
    },
    merchant: {
      id: row.merchantId,
      name: row.merchantName,
      category: row.merchantCategory,
      country: row.merchantCountry,
      city: row.merchantCity,
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

const AGENT_SKILLS = {
  customer: {
    name: "customer_history.lookup",
    goal: "Compare the transaction against customer profile, baseline payment size, and recalled customer memories."
  },
  merchant: {
    name: "merchant_risk.score",
    goal: "Read merchant profile and memory signals to determine merchant-side risk."
  },
  network: {
    name: "network_graph.expand",
    goal: "Expand the case graph around customer, receiver, device, payout account, and merchant evidence."
  },
  policy: {
    name: "policy_match.evaluate",
    goal: "Match computed case facts against fraud operations policy and choose a recommended action."
  },
  memory: {
    name: "memory_recall.retrieve",
    goal: "Retrieve prior customer and merchant memories and prepare a durable memory writeback."
  }
};

const AGENT_ID_BY_NAME = {
  "Customer History Agent": "customer",
  "Merchant Risk Agent": "merchant",
  "Network Graph Agent": "network",
  "Policy Agent": "policy"
};

const AGENT_LABEL_BY_ID = {
  customer: "Customer History Agent",
  merchant: "Merchant Risk Agent",
  network: "Network Graph Agent",
  policy: "Policy Agent"
};

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
        skill: AGENT_SKILLS.customer.name,
        goal: AGENT_SKILLS.customer.goal,
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
        skill: AGENT_SKILLS.merchant.name,
        goal: AGENT_SKILLS.merchant.goal,
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
        skill: AGENT_SKILLS.network.name,
        goal: AGENT_SKILLS.network.goal,
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
        skill: AGENT_SKILLS.policy.name,
        goal: AGENT_SKILLS.policy.goal,
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
        skill: AGENT_SKILLS.memory.name,
        goal: AGENT_SKILLS.memory.goal,
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

async function buildAgentTimeline(bundle) {
  const analysis = analyze(bundle);
  const timelineAgents = analysis.agents.filter((agent) => AGENT_ID_BY_NAME[agent.name]);
  const agentEntries = await Promise.all(
    timelineAgents.map(async (agent, index) => {
      const agentId = AGENT_ID_BY_NAME[agent.name];
      const message = initialAnalysisAgentMessage(agentId, bundle);
      const reply = await runChatAgent({ agentId, agent, bundle, analysis, message });
      return {
        type: "agent",
        agent: agentId,
        ts: `T+${2 + index * 2}s`,
        narrative: reply.narrative,
        finding: reply.finding,
        inspect: [
          ...inspectItems(agent, bundle),
          {
            kind: "result",
            text: agentResponseSourceText(reply)
          }
        ],
        viz: agentViz(agentId, bundle, analysis)
      };
    })
  );

  return [
    {
      type: "system",
      ts: "T+0s",
      text: `Case ${bundle.case.id} opened from TiDB data; agents will run scoped skills over case, graph, memory, and policy tables.`
    },
    ...agentEntries,
    synthesisPayload({ riskCase: bundle.case, score: analysis.score, confidence: confidenceForScore(analysis.score) })
  ];
}

function initialAnalysisAgentMessage(agentId, bundle) {
  const label = AGENT_LABEL_BY_ID[agentId] || agentId;
  return [
    `Run the initial investigation for case ${bundle.case.id} as the ${label}.`,
    "Use the supplied TiDB-backed tool observations, produce an evidence-bound timeline update, and avoid inventing facts."
  ].join(" ");
}

function chatAgentTargets(message) {
  const normalized = message.toLowerCase();
  const explicit = [
    ["customer", /@customer|客户|customer|history|profile|baseline/],
    ["merchant", /@merchant|商户|merchant|chargeback|payout/],
    ["network", /@network|网络|network|graph|ring|cluster|关联/],
    ["policy", /@policy|政策|policy|rule|规则|reg|hold|escalate/]
  ].flatMap(([agent, pattern]) => pattern.test(normalized) ? [agent] : []);
  if (normalized.includes("@all") || normalized.includes("all agents") || normalized.includes("所有")) {
    return ["customer", "merchant", "network", "policy"];
  }
  return explicit.length ? [...new Set(explicit)] : ["customer", "merchant", "network", "policy"];
}

async function chatWithAgents(caseId, message) {
  const bundle = await getCaseBundle(caseId);
  if (!bundle) return null;

  const analysis = analyze(bundle);
  const agentById = new Map(
    analysis.agents
      .filter((agent) => AGENT_ID_BY_NAME[agent.name])
      .map((agent) => [AGENT_ID_BY_NAME[agent.name], agent])
  );
  const events = [
    {
      type: "analyst_message",
      entry: {
        type: "analyst",
        user: "maya",
        ts: "Now",
        text: message
      }
    }
  ];

  for (const agentId of chatAgentTargets(message)) {
    const agent = agentById.get(agentId);
    if (!agent) continue;
    const reply = await runChatAgent({ agentId, agent, bundle, analysis, message });
    events.push({ type: "agent_status", agent: agentId, status: "working" });
    events.push({
      type: "agent_message",
      entry: {
        type: "agent",
        agent: agentId,
        ts: "Now",
        narrative: reply.narrative,
        finding: reply.finding,
        inspect: [
          ...inspectItems(agent, bundle),
          {
            kind: "result",
            text: agentResponseSourceText(reply)
          }
        ],
        viz: agentViz(agentId, bundle, analysis)
      }
    });
    events.push({ type: "agent_status", agent: agentId, status: "done" });
  }

  return events;
}

function agentResponseSourceText(reply) {
  if (reply.provider === "codex") {
    return `Real AI agent response generated by Codex CLI${reply.model ? ` (${reply.model})` : ""}.`;
  }
  if (reply.provider === "openai") {
    return `Real AI agent response generated by ${reply.model}.`;
  }
  return "Deterministic fallback used because no real agent provider completed successfully.";
}

async function runChatAgent({ agentId, agent, bundle, analysis, message }) {
  if (isCodexProvider()) {
    try {
      return await runCodexAgent({ agentId, agent, bundle, analysis, message });
    } catch (error) {
      console.error("Codex agent call failed, falling back to deterministic response", {
        agent: agentId,
        provider: agentProvider,
        message: error.message
      });
    }
  }

  if (agentProvider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      return await runOpenAIAgent({ agentId, agent, bundle, analysis, message });
    } catch (error) {
      console.error("AI agent call failed, falling back to deterministic response", {
        agent: agentId,
        provider: agentProvider,
        message: error.message
      });
    }
  }

  return {
    provider: "deterministic",
    model: "local-skill-fallback",
    narrative: chatAgentNarrative(agentId, agent, bundle, analysis, message),
    finding: agent.finding
  };
}

async function runOpenAIAgent({ agentId, agent, bundle, analysis, message }) {
  const context = agentTaskContext(agentId, agent, bundle, analysis, message);
  const system = [
    "You are a fraud-risk investigation AI agent embedded in an analyst workspace.",
    "You receive one analyst task, inspect the provided tool observations, reason from evidence, and answer as the named specialized agent.",
    "Do not invent data outside the supplied context. Separate facts from inference. Keep the answer concise and operational.",
    "Return only valid JSON with fields: narrative, finding, confidence."
  ].join(" ");
  const user = JSON.stringify(context, null, 2);

  const response = await fetchWithTimeout(`${agentBaseUrl}/responses`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: agentModel,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.2,
      max_output_tokens: 700
    })
  }, agentTimeoutMs);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenAI Responses API failed: ${response.status} ${response.statusText}${body ? ` ${body}` : ""}`);
  }

  const data = await response.json();
  const text = responseText(data);
  const parsed = parseAgentJson(text);
  return {
    provider: "openai",
    model: agentModel,
    narrative: cleanText(parsed.narrative || text || chatAgentNarrative(agentId, agent, bundle, analysis, message)),
    finding: cleanText(parsed.finding || agent.finding),
    confidence: Number(parsed.confidence || agent.confidence || 0)
  };
}

async function runCodexAgent({ agentId, agent, bundle, analysis, message }) {
  const context = agentTaskContext(agentId, agent, bundle, analysis, message);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "risk-agent-codex-"));
  const outputFile = path.join(tmpDir, "last-message.json");
  const prompt = [
    "You are a fraud-risk investigation AI agent embedded in an analyst workspace.",
    "You receive one analyst task and a compact JSON package of tool observations already read from TiDB-backed storage.",
    "Think through the evidence internally, but return only valid JSON.",
    "Do not invent facts outside the supplied context.",
    "Return exactly this shape: {\"narrative\":\"...\",\"finding\":\"...\",\"confidence\":0.0}.",
    "",
    JSON.stringify(context, null, 2)
  ].join("\n");
  const args = [
    "exec",
    "--ephemeral",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only",
    "--cd",
    root,
    "--output-last-message",
    outputFile
  ];
  if (codexModel) args.push("--model", codexModel);
  args.push("-");

  try {
    await runCommand(codexBin, args, prompt, agentTimeoutMs);
    const text = fs.readFileSync(outputFile, "utf8").trim();
    const parsed = parseAgentJson(text);
    return {
      provider: "codex",
      model: codexModel || "codex-default",
      narrative: cleanText(parsed.narrative || text || chatAgentNarrative(agentId, agent, bundle, analysis, message)),
      finding: cleanText(parsed.finding || agent.finding),
      confidence: Number(parsed.confidence || agent.confidence || 0)
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function runCommand(command, args, input, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: {
        ...process.env,
        HOME: process.env.HOME || "/Users/bb7133",
        PATH: process.env.PATH || "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      },
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > 8000) stdout = stdout.slice(-8000);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) return resolve({ stdout, stderr });
      reject(new Error(`${command} exited ${code}: ${stderr || stdout}`));
    });
    child.stdin.end(input);
  });
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function responseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") parts.push(content.text);
      if (typeof content.output_text === "string") parts.push(content.output_text);
    }
  }
  return parts.join("\n").trim();
}

function parseAgentJson(text) {
  if (!text) return {};
  const stripped = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function agentTaskContext(agentId, agent, bundle, analysis, message) {
  return {
    task: {
      message,
      requestedAgent: AGENT_LABEL_BY_ID[agentId],
      skill: agent.skill,
      goal: agent.goal
    },
    case: {
      id: bundle.case.id,
      priority: bundle.case.priority,
      status: bundle.case.status,
      reason: bundle.case.reason,
      transaction: bundle.transaction,
      customer: bundle.customer,
      merchant: bundle.merchant
    },
    toolObservations: agentToolObservations(agentId, agent, bundle, analysis),
    currentSynthesis: {
      score: analysis.score,
      conclusion: analysis.conclusion,
      recommendation: analysis.recommendation
    },
    responseContract: {
      narrative: "First-person answer from the specialized agent to the analyst.",
      finding: "One sentence finding backed by supplied evidence.",
      confidence: "Number from 0 to 1."
    }
  };
}

function agentToolObservations(agentId, agent, bundle, analysis) {
  if (agentId === "customer") {
    return {
      tools: ["read_customer_profile", "query_transactions", "recall_customer_memory"],
      facts: {
        customer: bundle.customer,
        transactionAmount: bundle.transaction.amount,
        medianPayment: bundle.customer.medianPayment,
        amountRatio: Number((bundle.transaction.amount / bundle.customer.medianPayment).toFixed(2)),
        memories: bundle.memory.filter((item) => item.subjectId === bundle.customer.id).slice(0, 5)
      },
      deterministicFinding: agent.finding
    };
  }
  if (agentId === "merchant") {
    return {
      tools: ["read_merchant_profile", "recall_merchant_memory", "compare_chargeback_risk"],
      facts: {
        merchant: bundle.merchant,
        memories: bundle.memory.filter((item) => item.subjectId === bundle.merchant.id).slice(0, 5),
        evidence: bundle.evidence.slice(0, 5)
      },
      deterministicFinding: agent.finding
    };
  }
  if (agentId === "network") {
    return {
      tools: ["expand_network_graph", "query_evidence_files", "rank_high_risk_edges"],
      facts: {
        graph: bundle.graph.slice(0, 12),
        highRiskEdges: bundle.graph.filter((edge) => edge.risk >= 80).slice(0, 12),
        evidence: bundle.evidence.slice(0, 8)
      },
      deterministicFinding: agent.finding
    };
  }
  if (agentId === "policy") {
    return {
      tools: ["read_policy_document", "evaluate_case_facts", "recommend_action"],
      facts: {
        policyExcerpt: analysis.policyExcerpt,
        score: analysis.score,
        conclusion: analysis.conclusion,
        recommendation: analysis.recommendation
      },
      deterministicFinding: agent.finding
    };
  }
  return { tools: [agent.skill], facts: {}, deterministicFinding: agent.finding };
}

function chatAgentNarrative(agentId, agent, bundle, analysis, message) {
  const prompt = message.replace(/\s+/g, " ").trim();
  const prefix = `${agent.skill} received the analyst message "${prompt}".`;
  if (agentId === "customer") {
    return `${prefix} I rechecked customer ${bundle.customer.id}, payment baseline, and recalled customer memory. ${agent.finding}`;
  }
  if (agentId === "merchant") {
    return `${prefix} I re-scored merchant ${bundle.merchant.id} using merchant profile and memory signals. ${agent.finding}`;
  }
  if (agentId === "network") {
    return `${prefix} I expanded the graph around case ${bundle.case.id} and checked high-risk adjacent edges. ${agent.finding}`;
  }
  if (agentId === "policy") {
    return `${prefix} I matched the current facts against the policy extract and recommendation threshold. ${agent.finding} Current synthesis remains: ${analysis.recommendation}`;
  }
  return `${prefix} ${agent.finding}`;
}

function agentNarrative(agent, bundle, analysis) {
  const skill = agent.skill || "agent.skill";
  const firstStep = agent.steps?.[0] || `Loaded case ${bundle.case.id}.`;
  const secondStep = agent.steps?.[1] || "Computed risk signals from available evidence.";
  return `${skill} ran against live case data. ${firstStep} ${secondStep} Current risk score contribution supports: ${analysis.conclusion}`;
}

function inspectItems(agent, bundle) {
  const outputs = [];
  outputs.push({
    kind: "tool",
    name: `skill:${agent.skill}`,
    q: agent.sql
  });
  outputs.push({
    kind: "result",
    text: `${agent.goal} Reads: ${agent.reads.join(", ")}. Writes: ${agent.writes.join(", ")}.`
  });
  for (const step of agent.steps.slice(0, 3)) {
    outputs.push({ kind: "result", text: step });
  }
  const evidence = agent.evidence.slice(0, 3);
  for (const item of evidence) {
    outputs.push({ kind: "result", text: `Evidence: ${item}` });
  }
  outputs.push({
    kind: "file",
    name: `${agent.skill.replaceAll(".", "_")}_${bundle.case.id}.md`,
    size: "TiDB-backed"
  });
  return outputs;
}

function agentViz(agentId, bundle, analysis) {
  const { transaction, customer, merchant, graph } = bundle;
  const amount = Number(transaction.amount || 0);
  const median = Math.max(1, Number(customer.medianPayment || 1));
  if (agentId === "customer") {
    return {
      baseline: [
        [9, Math.round(median * 0.7)],
        [11, Math.round(median * 0.9)],
        [13, Math.round(median * 1.1)],
        [15, Math.round(median * 1.3)],
        [18, Math.round(median * 0.8)]
      ],
      outlier: { x: hourOf(transaction.occurredAt), y: amount, label: `${(amount / median).toFixed(1)}x median` },
      caption: `Customer baseline from TiDB customer profile; current transaction ${transaction.currency} ${amount}.`
    };
  }
  if (agentId === "merchant") {
    return {
      merchantRate: Number(merchant.riskScore || 0),
      industry: { p50: 35, p90: 70, p99: 92 },
      max: 100,
      caption: `Merchant risk score ${merchant.riskScore}; compared with static industry benchmark.`
    };
  }
  if (agentId === "network") {
    const nodes = graphNodes(bundle).slice(0, 7);
    return {
      nodes,
      edges: graph.slice(0, 8).map((edge) => ({ a: edge.source, b: edge.target, mule: Number(edge.risk) >= 80 })),
      caption: `${graph.length} graph edge(s), ${graph.filter((edge) => Number(edge.risk) >= 80).length} high-risk.`
    };
  }
  if (agentId === "policy") {
    return {
      rows: [
        {
          code: "P-ESC",
          title: "Escalate fraud operations",
          trigger: analysis.score >= 85 ? "matched" : "not matched",
          eligibility: ["risk_score >= 85", "merchant risk or amount anomaly present"]
        },
        {
          code: "P-HOLD",
          title: "Conditional hold",
          trigger: analysis.score >= 65 ? "matched" : "not matched",
          eligibility: ["risk_score >= 65", "human confirmation required"]
        }
      ],
      caption: "Policy skill matched computed case facts against fraud-policy.md."
    };
  }
  return undefined;
}

function graphNodes(bundle) {
  const seen = new Set();
  const nodes = [];
  const add = (id, kind) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    const index = nodes.length;
    nodes.push({
      id,
      x: 40 + (index % 4) * 85,
      y: 45 + Math.floor(index / 4) * 70,
      r: index < 2 ? 12 : 9,
      kind
    });
  };
  add(bundle.customer.id, "victim");
  add(bundle.merchant.id, Number(bundle.merchant.riskScore) >= 80 ? "mule" : "receiver");
  for (const edge of bundle.graph) {
    add(edge.source, Number(edge.risk) >= 80 ? "mule" : "neutral");
    add(edge.target, Number(edge.risk) >= 80 ? "settle" : "neutral");
  }
  return nodes;
}

function hourOf(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 12 : date.getUTCHours();
}

function confidenceForScore(score) {
  return score >= 85 ? 0.91 : score >= 65 ? 0.82 : 0.68;
}

function synthesisPayload({ riskCase, score, confidence }) {
  return {
    type: "synthesis",
    ts: "T+10s",
    score,
    confidence,
    verdicts: [
      { agent: "customer", label: "Anomaly", level: score >= 85 ? "HIGH" : "MED", tone: score >= 85 ? "danger" : "warn" },
      { agent: "merchant", label: "Merchant", level: riskCase.priority === "P1" ? "HIGH" : "MED", tone: riskCase.priority === "P1" ? "danger" : "warn" },
      { agent: "network", label: "Network", level: score >= 85 ? "HIGH" : "MED", tone: score >= 85 ? "danger" : "warn" },
      { agent: "policy", label: "Policy", level: score >= 85 ? "AUTO-HOLD" : "REVIEW", tone: "warn" }
    ],
    narrative: synthesisNarrative(riskCase.id, score),
    file: `recommended_action_${riskCase.id}.md`,
    cited: [
      { f: `customer_history_lookup_${riskCase.id}.md`, a: "customer" },
      { f: `merchant_risk_score_${riskCase.id}.md`, a: "merchant" },
      { f: `network_graph_expand_${riskCase.id}.json`, a: "network" },
      { f: `policy_match_evaluate_${riskCase.id}.md`, a: "policy" }
    ],
    actions: synthesisActions(score)
  };
}

function synthesisNarrative(caseId, score) {
  return score >= 85
    ? `High-confidence fraud investigation for ${caseId}; keep the transaction held and escalate with evidence-bound writeback.`
    : `Elevated-risk investigation for ${caseId}; keep under review until customer and merchant evidence is confirmed.`;
}

function synthesisActions(score) {
  return score >= 85
    ? [
        { t: "Hold transaction", d: "Keep funds held pending fraud-ops review." },
        { t: "Open dispute case", d: "Start customer-confirmation and dispute workflow." },
        { t: "Write pattern memory", d: "Persist the graph pattern for future recall." }
      ]
    : [
        { t: "Manual review", d: "Review the transaction before release." },
        { t: "Write risk note", d: "Persist the elevated-risk signal for future recall." }
      ];
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, {
        ok: true,
        service: "risk-investigation-api",
        repository: repositoryName,
        agentRuntime: activeAgentRuntime(),
        agentModel: activeAgentModel()
      });
    }

    if (req.method === "GET" && url.pathname === "/api/cases") {
      const source = url.searchParams.get("source") || "guided";
      const priority = url.searchParams.get("priority") || "all";
      const query = url.searchParams.get("q") || "";
      const limit = Math.min(Number(url.searchParams.get("limit") || 250), 2000);
      return json(res, 200, await listCases({ source, priority, query, limit }));
    }

    const timelineMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/timeline$/);
    if (req.method === "GET" && timelineMatch) {
      return json(res, 200, await getCaseTimeline(timelineMatch[1]));
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

    const chatMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/chat$/);
    if (req.method === "POST" && chatMatch) {
      const body = await readJsonBody(req);
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message) return json(res, 400, { error: "message_required" });
      const result = await chatWithAgents(chatMatch[1], message);
      return result ? json(res, 200, result) : notFound(res);
    }

    const executeMatch = url.pathname.match(/^\/api\/cases\/([^/]+)\/execute$/);
    if (req.method === "POST" && executeMatch) {
      const result = await resolveCase(executeMatch[1]);
      return result ? json(res, 200, result) : notFound(res);
    }

    if (req.method === "GET" && url.pathname === "/api/schema") {
      const schema = tidbPool ? await readTidbSchema() : fs.readFileSync(path.join(root, "docs", "frontend-data-contract.md"), "utf8");
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

async function readTidbSchema() {
  const tables = [
    "customers",
    "merchants",
    "transactions",
    "risk_cases",
    "evidence_files",
    "network_edges",
    "memory_events",
    "agent_findings",
    "policy_documents",
    "case_timeline_events",
    "case_agent_status",
    "case_synthesis",
    "case_actions"
  ];
  const chunks = [];
  for (const table of tables) {
    const [rows] = await tidbPool.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = rows[0]?.["Create Table"];
    if (createSql) chunks.push(`${createSql};`);
  }
  return chunks.join("\n\n");
}

async function resolveCase(caseId) {
  const bundle = await getCaseBundle(caseId);
  if (!bundle) return null;
  const pattern = `cluster_RING_${String(140 + (Number(caseId.replace(/\D/g, "")) % 60)).padStart(3, "0")}`;
  const result = {
    dispute_id: `DSP-${caseId.replace(/\D/g, "").slice(-6).padStart(6, "0")}`,
    pattern_saved: pattern
  };
  if (tidbPool) {
    await tidbPool.query(
      "UPDATE risk_cases SET status = 'resolved', unread = 0, resolved_at = CURRENT_TIMESTAMP WHERE id = :caseId",
      { caseId }
    );
  }
  return result;
}
