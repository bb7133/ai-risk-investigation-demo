import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const database = process.env.TIDB_DEMO_DATABASE || "riskops_ai_demo";

const guidedData = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
const policy = fs.readFileSync(path.join(root, "data", "policies", "fraud-policy.md"), "utf8");

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

function readGenerated(fileName) {
  return parseCsv(fs.readFileSync(path.join(root, "data", "paysim-like", fileName), "utf8"));
}

function readGeneratedOptional(fileName) {
  const filePath = path.join(root, "data", "paysim-like", fileName);
  return fs.existsSync(filePath) ? parseCsv(fs.readFileSync(filePath, "utf8")) : [];
}

function countryFor(id) {
  const countries = ["KR", "JP", "SG", "US", "HK"];
  const n = Number(id.replace(/\D/g, "").slice(-6)) || 0;
  return countries[n % countries.length];
}

function generatedCustomer(id, amount = 0, priority = "P3", isFraud = false) {
  const medianRatio = isFraud ? 16 : priority === "P1" ? 9 : priority === "P2" ? 5 : 3;
  const name = `Client ${id.slice(-4)}`;
  return {
    id,
    name,
    risk_tier: isFraud ? "watchlist" : priority === "P1" ? "review" : "standard",
    country: countryFor(id),
    created_at: "2025-01-01 00:00:00",
    median_payment: Math.max(20, Math.round(Number(amount || 0) / medianRatio) || 100),
    email: `${id.toLowerCase()}@example.com`,
    phone: phoneFor(id),
    initials: initialsFor(name),
    member_since: memberSinceFor(id),
    tier: isFraud || priority === "P1" ? "Premium" : priority === "P2" ? "Business" : "Standard"
  };
}

function generatedMerchant(id, type = "PAYMENT", priority = "P3", isFraud = false, isFlagged = false) {
  const destinationIsMerchant = id.startsWith("M");
  return {
    id,
    name: destinationIsMerchant ? `Merchant ${id.slice(-4)}` : `Beneficiary ${id.slice(-4)}`,
    category: destinationIsMerchant ? "merchant payment" : type.toLowerCase().replaceAll("_", " "),
    country: countryFor(id),
    risk_score: isFraud ? 93 : isFlagged ? 88 : priority === "P1" ? 84 : priority === "P2" ? 68 : 43,
    city: cityFor(id)
  };
}

async function main() {
  const connectionOptions = {
    host: required("TIDB_DEMO_HOST"),
    port: Number(process.env.TIDB_DEMO_PORT || 4000),
    user: required("TIDB_DEMO_USER"),
    password: required("TIDB_DEMO_PASSWORD"),
    ssl: process.env.TIDB_DEMO_SSL_CA ? { ca: fs.readFileSync(process.env.TIDB_DEMO_SSL_CA, "utf8") } : {}
  };

  const rootConn = await mysql.createConnection(connectionOptions);
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await rootConn.end();

  const conn = await mysql.createConnection({ ...connectionOptions, database, multipleStatements: true });
  await createSchema(conn);
  await truncateTables(conn);
  await importGuided(conn);
  await importGenerated(conn);
  await conn.query(
    "INSERT INTO policy_documents (id, title, content, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), updated_at=VALUES(updated_at)",
    ["fraud-policy", "Payment Risk Policy Extract", policy]
  );

  const [counts] = await conn.query(`
    SELECT 'customers' AS table_name, COUNT(*) AS count FROM customers
    UNION ALL SELECT 'merchants', COUNT(*) FROM merchants
    UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
    UNION ALL SELECT 'risk_cases', COUNT(*) FROM risk_cases
    UNION ALL SELECT 'evidence_files', COUNT(*) FROM evidence_files
    UNION ALL SELECT 'network_edges', COUNT(*) FROM network_edges
    UNION ALL SELECT 'memory_events', COUNT(*) FROM memory_events
    UNION ALL SELECT 'case_timeline_events', COUNT(*) FROM case_timeline_events
    UNION ALL SELECT 'case_agent_status', COUNT(*) FROM case_agent_status
    UNION ALL SELECT 'case_synthesis', COUNT(*) FROM case_synthesis
    UNION ALL SELECT 'case_actions', COUNT(*) FROM case_actions
  `);
  await conn.end();

  console.log(`Imported demo data into TiDB database ${database}`);
  for (const row of counts) {
    console.log(`${row.table_name}: ${row.count}`);
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env ${name}`);
  return value;
}

async function createSchema(conn) {
  await conn.query(`
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  risk_tier VARCHAR(32) NOT NULL,
  country VARCHAR(32) NOT NULL,
  created_at DATETIME NOT NULL,
  median_payment DECIMAL(18,2) NOT NULL,
  email VARCHAR(256),
  phone VARCHAR(64),
  initials VARCHAR(8),
  member_since DATE,
  tier VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS merchants (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  country VARCHAR(32) NOT NULL,
  risk_score INT NOT NULL,
  city VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(32) PRIMARY KEY,
  source VARCHAR(16) NOT NULL,
  customer_id VARCHAR(32) NOT NULL,
  merchant_id VARCHAR(32) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  status VARCHAR(32) NOT NULL,
  occurred_at DATETIME NOT NULL,
  raw_type VARCHAR(32),
  is_fraud TINYINT DEFAULT 0,
  is_flagged_fraud TINYINT DEFAULT 0,
  INDEX idx_transaction_customer_time (customer_id, occurred_at),
  INDEX idx_transaction_merchant_time (merchant_id, occurred_at)
);

CREATE TABLE IF NOT EXISTS risk_cases (
  id VARCHAR(32) PRIMARY KEY,
  source VARCHAR(16) NOT NULL,
  transaction_id VARCHAR(32) NOT NULL,
  priority VARCHAR(16) NOT NULL,
  status VARCHAR(32) NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  unread INT NOT NULL DEFAULT 0,
  contact TEXT,
  resolved_at DATETIME,
  INDEX idx_risk_cases_source_priority (source, priority, created_at),
  INDEX idx_risk_cases_status_priority (status, priority, created_at)
);

CREATE TABLE IF NOT EXISTS evidence_files (
  id VARCHAR(64) PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  kind VARCHAR(64) NOT NULL,
  title VARCHAR(256) NOT NULL,
  uri TEXT NOT NULL,
  summary TEXT NOT NULL,
  INDEX idx_evidence_case (case_id)
);

CREATE TABLE IF NOT EXISTS network_edges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  source VARCHAR(64) NOT NULL,
  target VARCHAR(64) NOT NULL,
  edge_type VARCHAR(64) NOT NULL,
  risk INT NOT NULL,
  INDEX idx_network_case (case_id),
  INDEX idx_network_source (source),
  INDEX idx_network_target (target)
);

CREATE TABLE IF NOT EXISTS memory_events (
  id VARCHAR(64) PRIMARY KEY,
  subject_type VARCHAR(32) NOT NULL,
  subject_id VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_memory_subject (subject_type, subject_id, created_at)
);

CREATE TABLE IF NOT EXISTS agent_findings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  agent_name VARCHAR(128) NOT NULL,
  finding TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent_findings_case (case_id)
);

CREATE TABLE IF NOT EXISTS policy_documents (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS case_timeline_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  event_order INT NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  agent_id VARCHAR(32),
  ts_label VARCHAR(32) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_case_event_order (case_id, event_order),
  INDEX idx_case_timeline (case_id, event_order)
);

CREATE TABLE IF NOT EXISTS case_agent_status (
  case_id VARCHAR(32) NOT NULL,
  agent_id VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id, agent_id)
);

CREATE TABLE IF NOT EXISTS case_synthesis (
  case_id VARCHAR(32) PRIMARY KEY,
  score INT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  narrative TEXT NOT NULL,
  payload JSON NOT NULL,
  resolved_payload JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(32) NOT NULL,
  action_type VARCHAR(64) NOT NULL,
  action_detail TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  executed_at DATETIME,
  INDEX idx_case_actions (case_id, status)
);
`);
  await addColumnIfMissing(conn, "customers", "email", "VARCHAR(256)");
  await addColumnIfMissing(conn, "customers", "phone", "VARCHAR(64)");
  await addColumnIfMissing(conn, "customers", "initials", "VARCHAR(8)");
  await addColumnIfMissing(conn, "customers", "member_since", "DATE");
  await addColumnIfMissing(conn, "customers", "tier", "VARCHAR(32)");
  await addColumnIfMissing(conn, "merchants", "city", "VARCHAR(128)");
  await addColumnIfMissing(conn, "risk_cases", "unread", "INT NOT NULL DEFAULT 0");
  await addColumnIfMissing(conn, "risk_cases", "contact", "TEXT");
  await addColumnIfMissing(conn, "risk_cases", "resolved_at", "DATETIME");
}

async function addColumnIfMissing(conn, table, column, definition) {
  const [rows] = await conn.query(
    "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  if (Number(rows[0]?.count || 0) === 0) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function truncateTables(conn) {
  const tables = [
    "case_actions",
    "case_synthesis",
    "case_agent_status",
    "case_timeline_events",
    "agent_findings",
    "policy_documents",
    "memory_events",
    "network_edges",
    "evidence_files",
    "risk_cases",
    "transactions",
    "merchants",
    "customers"
  ];
  for (const table of tables) {
    await conn.query(`TRUNCATE TABLE ${table}`);
  }
}

async function importGuided(conn) {
  await insertRows(conn, "customers", guidedData.customers.map((item) => ({
    id: item.id,
    name: item.name,
    risk_tier: item.riskTier,
    country: item.country,
    created_at: item.createdAt.replace("T", " ").replace("Z", ""),
    median_payment: item.medianPayment,
    email: `${item.id}@example.com`,
    phone: phoneFor(item.id),
    initials: initialsFor(item.name),
    member_since: item.createdAt.slice(0, 10),
    tier: item.riskTier === "trusted" ? "Business" : item.riskTier === "watchlist" ? "Premium" : "Standard"
  })));
  await insertRows(conn, "merchants", guidedData.merchants.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    country: item.country,
    risk_score: item.riskScore,
    city: cityFor(item.id)
  })));
  await insertRows(conn, "transactions", guidedData.transactions.map((item) => ({
    id: item.id,
    source: "guided",
    customer_id: item.customerId,
    merchant_id: item.merchantId,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    occurred_at: item.occurredAt.replace("T", " ").replace("Z", ""),
    raw_type: "PAYMENT",
    is_fraud: 0,
    is_flagged_fraud: 0
  })));
  await insertRows(conn, "risk_cases", guidedData.cases.map((item) => ({
    id: item.id,
    source: "guided",
    transaction_id: item.transactionId,
    priority: item.priority,
    status: item.status,
    reason: item.reason,
    created_at: item.createdAt.replace("T", " ").replace("Z", ""),
    unread: item.priority === "P1" ? 3 : item.priority === "P2" ? 1 : 0,
    contact: item.id === "case_5001" ? "Customer report: suspicious transaction needs fraud review." : null,
    resolved_at: null
  })));
  await insertRows(conn, "evidence_files", guidedData.evidence.map((item) => ({
    id: item.id,
    case_id: item.caseId,
    kind: item.kind,
    title: item.title,
    uri: item.uri,
    summary: item.summary
  })));
  await insertRows(conn, "network_edges", guidedData.network.map((item) => ({
    case_id: "case_5001",
    source: item.source,
    target: item.target,
    edge_type: item.type,
    risk: item.risk
  })));
  await insertRows(conn, "memory_events", guidedData.memoryEvents.map((item) => ({
    id: item.id,
    subject_type: item.subjectType,
    subject_id: item.subjectId,
    event_type: item.eventType,
    content: item.content,
    confidence: item.confidence,
    created_at: item.createdAt.replace("T", " ").replace("Z", "")
  })));
  await importGuidedWorkflow(conn);
}

async function importGenerated(conn) {
  const transactions = readGenerated("transactions.csv");
  const cases = readGenerated("risk_cases.csv");
  const network = readGenerated("network_edges.csv");
  const memoryEvents = readGenerated("memory_events.csv");
  const timelineEvents = readGeneratedOptional("case_timeline_events.csv");
  const agentStatuses = readGeneratedOptional("case_agent_status.csv");
  const syntheses = readGeneratedOptional("case_synthesis.csv");
  const actions = readGeneratedOptional("case_actions.csv");
  const transactionById = new Map(transactions.map((item) => [item.id, item]));

  const customers = new Map();
  const merchants = new Map();
  for (const row of transactions) {
    mergeCustomer(customers, generatedCustomer(row.nameOrig));
    mergeMerchant(merchants, generatedMerchant(row.nameDest, row.type));
  }
  for (const riskCase of cases) {
    const row = transactionById.get(riskCase.transaction_id);
    if (!row) continue;
    const isFraud = row.isFraud === "1";
    const isFlagged = row.isFlaggedFraud === "1";
    mergeCustomer(customers, generatedCustomer(row.nameOrig, row.amount, riskCase.priority, isFraud));
    mergeMerchant(merchants, generatedMerchant(row.nameDest, row.type, riskCase.priority, isFraud, isFlagged));
  }

  await insertRows(conn, "customers", Array.from(customers.values()));
  await insertRows(conn, "merchants", Array.from(merchants.values()));
  await insertRows(conn, "transactions", transactions.map((item) => ({
    id: item.id,
    source: "generated",
    customer_id: item.nameOrig,
    merchant_id: item.nameDest,
    amount: item.amount,
    currency: "USD",
    status: "settled",
    occurred_at: new Date(Date.UTC(2026, 4, 12, 0, Number(item.step || 0))).toISOString().slice(0, 19).replace("T", " "),
    raw_type: item.type,
    is_fraud: Number(item.isFraud),
    is_flagged_fraud: Number(item.isFlaggedFraud)
  })));
  await insertRows(conn, "risk_cases", cases.map((item) => {
    const tx = transactionById.get(item.transaction_id);
    return {
      id: item.id,
      source: "generated",
      transaction_id: item.transaction_id,
      priority: item.priority,
      status: item.status,
      reason: item.reason,
      created_at: new Date(Date.UTC(2026, 4, 12, 0, Number(tx?.step || item.created_step || 0))).toISOString().slice(0, 19).replace("T", " "),
      unread: Number(item.unread || (item.priority === "P1" ? 3 : item.priority === "P2" ? 1 : 0)),
      contact: item.contact || null,
      resolved_at: null
    };
  }));
  await insertRows(conn, "network_edges", network.map((item) => ({
    case_id: item.case_id,
    source: item.source,
    target: item.target,
    edge_type: item.edge_type,
    risk: Number(item.risk)
  })));
  await insertRows(conn, "evidence_files", network.map((item, index) => ({
    id: `${item.case_id}_ev_${index + 1}`,
    case_id: item.case_id,
    kind: item.edge_type,
    title: item.edge_type.replaceAll("_", " "),
    uri: `tidb://evidence/${item.case_id}/${item.edge_type}`,
    summary: `${item.source} -> ${item.target}, risk ${item.risk}.`
  })));
  await insertRows(conn, "memory_events", memoryEvents.map((item) => ({
    id: item.id,
    subject_type: item.subject_type,
    subject_id: item.subject_id,
    event_type: item.event_type,
    content: item.content,
    confidence: item.confidence,
    created_at: new Date(Date.UTC(2026, 4, 12, 0, Number(item.created_step || 0))).toISOString().slice(0, 19).replace("T", " ")
  })));
  await insertRows(conn, "case_timeline_events", timelineEvents.map((item) => ({
    case_id: item.case_id,
    event_order: Number(item.event_order),
    event_type: item.event_type,
    agent_id: item.agent_id || null,
    ts_label: item.ts_label,
    payload: item.payload_json,
    created_at: new Date(Date.UTC(2026, 4, 12, 0, Number(item.created_step || 0))).toISOString().slice(0, 19).replace("T", " ")
  })));
  await insertRows(conn, "case_agent_status", agentStatuses.map((item) => ({
    case_id: item.case_id,
    agent_id: item.agent_id,
    status: item.status
  })));
  await insertRows(conn, "case_synthesis", syntheses.map((item) => ({
    case_id: item.case_id,
    score: Number(item.score),
    confidence: item.confidence,
    narrative: item.narrative,
    payload: item.payload_json,
    resolved_payload: item.resolved_payload_json || null
  })));
  await insertRows(conn, "case_actions", actions.map((item) => ({
    case_id: item.case_id,
    action_type: item.action_type,
    action_detail: item.action_detail,
    status: item.status,
    executed_at: null
  })));
}

function mergeCustomer(customers, candidate) {
  const existing = customers.get(candidate.id);
  if (!existing) {
    customers.set(candidate.id, candidate);
    return;
  }
  const rank = { trusted: 0, standard: 1, review: 2, watchlist: 3 };
  const tierRank = { Standard: 0, Business: 1, Premium: 2 };
  customers.set(candidate.id, {
    ...existing,
    risk_tier: rank[candidate.risk_tier] > rank[existing.risk_tier] ? candidate.risk_tier : existing.risk_tier,
    median_payment: Math.min(Number(existing.median_payment), Number(candidate.median_payment)),
    tier: tierRank[candidate.tier] > tierRank[existing.tier] ? candidate.tier : existing.tier,
    email: existing.email || candidate.email,
    phone: existing.phone || candidate.phone,
    initials: existing.initials || candidate.initials,
    member_since: existing.member_since || candidate.member_since
  });
}

function mergeMerchant(merchants, candidate) {
  const existing = merchants.get(candidate.id);
  merchants.set(candidate.id, existing
    ? { ...existing, risk_score: Math.max(Number(existing.risk_score), Number(candidate.risk_score)), city: existing.city || candidate.city }
    : candidate);
}

async function importGuidedWorkflow(conn) {
  const timelineRows = [];
  const statusRows = [];
  const synthesisRows = [];
  const actionRows = [];
  for (const item of guidedData.cases) {
    const bundle = guidedBundle(item);
    const workflow = workflowForBundle(bundle);
    timelineRows.push(...workflow.timelineRows);
    statusRows.push(...workflow.statusRows);
    synthesisRows.push(workflow.synthesisRow);
    actionRows.push(...workflow.actionRows);
  }
  await insertRows(conn, "case_timeline_events", timelineRows);
  await insertRows(conn, "case_agent_status", statusRows);
  await insertRows(conn, "case_synthesis", synthesisRows);
  await insertRows(conn, "case_actions", actionRows);
}

function guidedBundle(riskCase) {
  const transaction = guidedData.transactions.find((item) => item.id === riskCase.transactionId);
  const customer = guidedData.customers.find((item) => item.id === transaction.customerId);
  const merchant = guidedData.merchants.find((item) => item.id === transaction.merchantId);
  const evidence = guidedData.evidence.filter((item) => item.caseId === riskCase.id);
  const graph = guidedData.network.filter((edge) =>
    [customer.id, merchant.id].includes(edge.source) ||
    [customer.id, merchant.id].includes(edge.target) ||
    evidence.some((record) => edge.source.includes(record.id) || edge.target.includes(record.id))
  );
  return { riskCase, transaction, customer, merchant, evidence, graph };
}

function workflowForBundle({ riskCase, transaction, customer, merchant, evidence, graph }) {
  const amountRatio = Number(transaction.amount) / Number(customer.medianPayment || 1);
  const highRiskEdges = graph.filter((edge) => Number(edge.risk) >= 80);
  const score = Math.min(
    99,
    Math.round(
      Number(merchant.riskScore) * 0.42 +
        Math.min(40, amountRatio * 6) +
        highRiskEdges.length * 9 +
        evidence.length * 5
    )
  );
  const confidence = score >= 85 ? 0.91 : score >= 65 ? 0.82 : 0.68;
  const timeline = [
    {
      event_type: "system_event",
      agent_id: null,
      ts_label: "T+0s",
      payload: {
        type: "system",
        ts: "T+0s",
        text: `Case ${riskCase.id} opened; ${riskCase.priority} priority.`
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
        narrative: `${customer.name} risk tier is ${customer.riskTier}; current transaction is ${amountRatio.toFixed(1)}x median.`,
        finding: `Customer amount anomaly ${amountRatio.toFixed(1)}x baseline.`
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
        narrative: `${merchant.name} has risk score ${merchant.riskScore} in ${merchant.category}.`,
        finding: `Merchant risk score ${merchant.riskScore}.`
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
        narrative: `${highRiskEdges.length} high-risk edge(s) found in the case graph.`,
        finding: `${highRiskEdges.length} high-risk graph edge(s).`
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
        narrative: score >= 85 ? "Policy recommends escalation and hold." : "Policy recommends conditional review.",
        finding: score >= 85 ? "Escalation recommended." : "Review recommended."
      }
    },
    {
      event_type: "synthesis_ready",
      agent_id: null,
      ts_label: "T+10s",
      payload: synthesisPayload({ riskCase, score, confidence })
    }
  ];
  return {
    timelineRows: timeline.map((entry, index) => ({
      case_id: riskCase.id,
      event_order: index + 1,
      event_type: entry.event_type,
      agent_id: entry.agent_id,
      ts_label: entry.ts_label,
      payload: JSON.stringify(entry.payload),
      created_at: riskCase.createdAt.replace("T", " ").replace("Z", "")
    })),
    statusRows: ["customer", "merchant", "network", "policy"].map((agent) => ({
      case_id: riskCase.id,
      agent_id: agent,
      status: "done"
    })),
    synthesisRow: {
      case_id: riskCase.id,
      score,
      confidence,
      narrative: synthesisNarrative(riskCase.id, score),
      payload: JSON.stringify(synthesisPayload({ riskCase, score, confidence })),
      resolved_payload: null
    },
    actionRows: synthesisActions(score).map((action) => ({
      case_id: riskCase.id,
      action_type: action.t,
      action_detail: action.d,
      status: "recommended",
      executed_at: null
    }))
  };
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
      { f: `customer_pattern_${riskCase.id}.md`, a: "customer" },
      { f: `merchant_risk_${riskCase.id}.md`, a: "merchant" },
      { f: `network_graph_${riskCase.id}.json`, a: "network" },
      { f: `policy_match_${riskCase.id}.md`, a: "policy" }
    ],
    actions: synthesisActions(score)
  };
}

function synthesisNarrative(caseId, score) {
  return score >= 85
    ? `High-confidence fraud investigation for ${caseId}; keep the transaction held and escalate.`
    : `Elevated-risk investigation for ${caseId}; continue manual review before release.`;
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

function initialsFor(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function phoneFor(id) {
  const n = String(Number(id.replace(/\D/g, "").slice(-6)) || 0).padStart(6, "0");
  return `+1 415 ${n.slice(0, 3)} ${n.slice(3)}`;
}

function memberSinceFor(id) {
  const n = Number(id.replace(/\D/g, "").slice(-4)) || 0;
  return `${2018 + (n % 7)}-01-01`;
}

function cityFor(id) {
  const cities = ["San Francisco", "Tokyo", "Singapore", "Seoul", "Hong Kong", "Bali"];
  const n = Number(id.replace(/\D/g, "").slice(-6)) || 0;
  return cities[n % cities.length];
}

async function insertRows(conn, table, rows, chunkSize = 1000) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const columnSql = columns.map((column) => `\`${column}\``).join(", ");
  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `\`${column}\`=VALUES(\`${column}\`)`)
    .join(", ");
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const sql = `INSERT INTO \`${table}\` (${columnSql}) VALUES ${chunk.map(() => placeholders).join(", ")}${
      updates ? ` ON DUPLICATE KEY UPDATE ${updates}` : ""
    }`;
    const values = chunk.flatMap((row) => columns.map((column) => row[column]));
    await conn.query(sql, values);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
