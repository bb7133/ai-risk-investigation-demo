import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Database,
  FileText,
  HardDrive,
  Network,
  Play,
  ShieldCheck,
  Table2,
  Users
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8787";

function useAsync(factory, deps) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    factory()
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, data: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, deps);
  return state;
}

async function getJson(path, options) {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function App() {
  const healthState = useAsync(() => getJson("/api/health"), []);
  const [caseSource, setCaseSource] = useState("guided");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const casesState = useAsync(
    () =>
      getJson(
        `/api/cases?source=${caseSource}&priority=${priorityFilter}&q=${encodeURIComponent(query)}&limit=500`
      ),
    [caseSource, priorityFilter, query]
  );
  const cases = casesState.data?.cases || [];
  const [selectedCase, setSelectedCase] = useState("case_5001");
  const [investigation, setInvestigation] = useState(null);
  const [agentProgress, setAgentProgress] = useState(null);
  const [running, setRunning] = useState(false);
  const detailState = useAsync(() => getJson(`/api/cases/${selectedCase}`), [selectedCase]);
  const detail = detailState.data;

  useEffect(() => {
    if (cases.length > 0 && !cases.some((item) => item.id === selectedCase)) {
      setSelectedCase(cases[0].id);
    }
  }, [cases, selectedCase]);

  useEffect(() => {
    setInvestigation(null);
    setAgentProgress(null);
  }, [selectedCase]);

  async function runInvestigation() {
    setRunning(true);
    setInvestigation(null);
    setAgentProgress({
      stage: "Preparing investigation workspace",
      startedAt: Date.now(),
      elapsedMs: 0,
      activeAgent: null,
      completed: [],
      pending: []
    });
    const result = await getJson(`/api/cases/${selectedCase}/investigate`, { method: "POST" });
    const agents = result.analysis.agents;
    const schedule = [
      { stage: "Loading TiDB case bundle", activeAgent: null, delay: 550 },
      { stage: "Retrieving policy and memory context", activeAgent: null, delay: 650 },
      ...agents.map((agent, index) => ({
        stage: `Running ${agent.name}`,
        activeAgent: agent,
        delay: 850 + index * 180
      })),
      { stage: "Writing agent findings", activeAgent: null, delay: 650 },
      { stage: "Generating risk dossier", activeAgent: null, delay: 700 }
    ];

    let completed = [];
    const agentNames = agents.map((agent) => agent.name);
    let elapsed = 0;
    for (const step of schedule) {
      setAgentProgress({
        stage: step.stage,
        startedAt: Date.now() - elapsed,
        elapsedMs: elapsed,
        activeAgent: step.activeAgent?.name || null,
        completed,
        pending: agentNames.filter((name) => !completed.includes(name) && name !== step.activeAgent?.name)
      });
      elapsed += step.delay;
      await wait(step.delay);
      if (step.activeAgent) completed = [...completed, step.activeAgent.name];
      setAgentProgress({
        stage: step.stage,
        startedAt: Date.now() - elapsed,
        elapsedMs: elapsed,
        activeAgent: step.activeAgent?.name || null,
        completed,
        pending: agentNames.filter((name) => !completed.includes(name) && name !== step.activeAgent?.name)
      });
    }
    setInvestigation(result.analysis);
    setAgentProgress((prev) => ({
      ...prev,
      stage: "Investigation complete",
      activeAgent: null,
      completed: agents.map((agent) => agent.name),
      pending: []
    }));
    setTimeout(() => {
      setRunning(false);
    }, 350);
  }

  return (
    <main className="app-shell">
      <aside className="case-queue">
        <div className="brand">
          <ShieldCheck size={24} />
          <div>
            <h1>RiskOps AI</h1>
            <p>Fintech investigation console</p>
          </div>
        </div>

        <section className="queue-section">
          <div className="queue-header">
            <div>
              <div className="section-label">Open Cases</div>
              <small>
                {casesState.data?.total ?? cases.length} available
                {caseSource === "generated" ? " from generated data" : " in guided demo"}
              </small>
            </div>
          </div>
          <div className="queue-controls">
            <div className="source-toggle" role="group" aria-label="case source">
              <button
                className={caseSource === "guided" ? "active" : ""}
                onClick={() => setCaseSource("guided")}
              >
                Guided
              </button>
              <button
                className={caseSource === "generated" ? "active" : ""}
                onClick={() => setCaseSource("generated")}
              >
                Scale
              </button>
            </div>
            <div className="filter-row">
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                <option value="all">All priorities</option>
                <option value="P1">P1 only</option>
                <option value="P2">P2 only</option>
                <option value="P3">P3 only</option>
              </select>
              <input
                value={query}
                placeholder="Search case, customer, merchant"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          {casesState.loading && <div className="muted">Loading cases...</div>}
          {!casesState.loading && cases.length === 0 && <div className="muted">No matching cases.</div>}
          <div className="case-list">
            {cases.map((item) => (
              <button
                key={item.id}
                className={`case-button ${item.id === selectedCase ? "active" : ""}`}
                onClick={() => setSelectedCase(item.id)}
              >
                <span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span>
                <span className="case-main">
                  <strong>{item.id}</strong>
                  <small>{item.customer}</small>
                </span>
                <span className="amount">
                  {item.currency} {Number(item.amount).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="storage-panel">
          <Database size={18} />
          <div>
            <strong>TiDB story</strong>
            <p>
              Backend: {healthState.data?.repository === "tidb" ? "TiDB Zero" : "local files"}.
              Transactions, evidence, policies, and agent memory share one SQL substrate.
            </p>
          </div>
        </section>
      </aside>

      <section className="workspace">
        {detailState.loading || !detail ? (
          <div className="loading">Loading investigation context...</div>
        ) : (
          <>
            <CaseHeader detail={detail} onRun={runInvestigation} running={running} />
            <InvestigationFlow />
            <div className="work-grid">
              <ContextPanel detail={detail} />
              <GraphPanel detail={detail} />
              <AgentPanel analysis={investigation} running={running} progress={agentProgress} />
              <DataLayerPanel analysis={investigation} repository={healthState.data?.repository} />
              <DossierPanel analysis={investigation} detail={detail} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function InvestigationFlow() {
  return (
    <section className="investigation-flow" aria-label="investigation workflow">
      <div>
        <strong>Realtime Screening</strong>
        <span>rules and ML flag suspicious payment</span>
      </div>
      <ArrowRight size={16} />
      <div>
        <strong>Case Queue</strong>
        <span>high-value alerts enter review</span>
      </div>
      <ArrowRight size={16} />
      <div>
        <strong>Agent Investigation</strong>
        <span>evidence, graph, policy, memory</span>
      </div>
      <ArrowRight size={16} />
      <div>
        <strong>Human Action</strong>
        <span>review hold, release, or escalate</span>
      </div>
    </section>
  );
}

function CaseHeader({ detail, onRun, running }) {
  return (
    <header className="case-header">
      <div>
        <div className="eyebrow">Suspicious transaction</div>
        <h2>{detail.case.id}</h2>
        <p>{detail.case.reason}</p>
      </div>
      <button className="primary-action" onClick={onRun} disabled={running}>
        <Play size={17} />
        {running ? "Investigating" : "Run Investigation"}
      </button>
    </header>
  );
}

function ContextPanel({ detail }) {
  return (
    <section className="panel context-panel">
      <PanelTitle icon={<Users size={18} />} title="Case Context" />
      <div className="context-grid">
        <Metric label="Customer" value={detail.customer.name} sub={detail.customer.riskTier} />
        <Metric label="Merchant" value={detail.merchant.name} sub={`risk ${detail.merchant.riskScore}`} />
        <Metric label="Amount" value={`${detail.transaction.currency} ${detail.transaction.amount}`} sub="current transaction" />
        <Metric label="Median" value={`${detail.transaction.currency} ${detail.customer.medianPayment}`} sub="customer baseline" />
      </div>
      <div className="evidence-list">
        {detail.evidence.length === 0 ? (
          <p className="muted">No evidence file attached.</p>
        ) : (
          detail.evidence.map((item) => (
            <article key={item.id} className="evidence">
              <FileText size={16} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function GraphPanel({ detail }) {
  const nodes = useMemo(() => {
    const ids = new Set();
    detail.graph.forEach((edge) => {
      ids.add(edge.source);
      ids.add(edge.target);
    });
    return Array.from(ids);
  }, [detail.graph]);

  const positions = nodes.reduce((acc, id, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
    acc[id] = {
      x: 180 + Math.cos(angle) * 120,
      y: 140 + Math.sin(angle) * 86
    };
    return acc;
  }, {});

  return (
    <section className="panel graph-panel">
      <PanelTitle icon={<Network size={18} />} title="Network Evidence" />
      <svg viewBox="0 0 360 280" role="img" aria-label="risk network graph">
        {detail.graph.map((edge, index) => (
          <line
            key={`${edge.source}-${edge.target}-${index}`}
            x1={positions[edge.source]?.x || 0}
            y1={positions[edge.source]?.y || 0}
            x2={positions[edge.target]?.x || 0}
            y2={positions[edge.target]?.y || 0}
            className={edge.risk >= 80 ? "edge high" : "edge"}
          />
        ))}
        {nodes.map((id) => (
          <g key={id} transform={`translate(${positions[id].x}, ${positions[id].y})`}>
            <circle className={isMerchantNode(id) ? "node merchant" : isCustomerNode(id) ? "node customer" : "node"} r="19" />
            <text y="36">{shortNodeLabel(id)}</text>
          </g>
        ))}
      </svg>
      <div className="graph-legend">
        <span><i className="legend-dot customer" /> customer</span>
        <span><i className="legend-dot merchant" /> merchant</span>
        <span><i className="legend-line" /> high-risk edge</span>
      </div>
    </section>
  );
}

function isCustomerNode(id) {
  return id.startsWith("cus") || /^C\d/.test(id);
}

function isMerchantNode(id) {
  return id.startsWith("mer") || /^M\d/.test(id);
}

function shortNodeLabel(id) {
  return id.replace(/^(cus|mer|dev|acct)_/, "").slice(-8);
}

function AgentPanel({ analysis, running, progress }) {
  const agents = analysis?.agents || [];
  const [selectedAgent, setSelectedAgent] = useState(null);
  const liveAgents = running && progress?.completed?.length
    ? progress.completed.map((name) => ({ name, status: "complete" }))
    : [];
  const agentDetail = agents.find((agent) => agent.name === selectedAgent);

  useEffect(() => {
    if (!agents.some((agent) => agent.name === selectedAgent)) {
      setSelectedAgent(null);
    }
  }, [agents, selectedAgent]);

  return (
    <section className="panel agent-panel">
      <PanelTitle icon={<Activity size={18} />} title="Agent Workspace" />
      {running && <ProgressPanel progress={progress} />}
      {!running && agents.length === 0 && (
        <p className="muted">Run the investigation to assemble agent findings.</p>
      )}
      {running && liveAgents.length > 0 && (
        <div className="live-agent-list">
          {liveAgents.map((agent) => (
            <span key={agent.name}>{agent.name}</span>
          ))}
        </div>
      )}
      {agentDetail ? (
        <AgentDetailView agent={agentDetail} onBack={() => setSelectedAgent(null)} />
      ) : (
        <div className="agent-list">
          {agents.map((agent) => (
            <button key={agent.name} className="agent-card agent-card-button" onClick={() => setSelectedAgent(agent.name)}>
              <span className="agent-status">Complete</span>
              <div className="agent-summary">
                <strong>{agent.name}</strong>
                <p>{agent.finding}</p>
              </div>
              <span className="agent-confidence">{Math.round(agent.confidence * 100)}%</span>
              <span className="agent-open">View details</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function AgentDetailView({ agent, onBack }) {
  return (
    <div className="agent-detail-page">
      <div className="agent-detail-header">
        <button className="secondary-action" onClick={onBack}>Back</button>
        <div>
          <strong>{agent.name}</strong>
          <span>{Math.round(agent.confidence * 100)}% confidence</span>
        </div>
      </div>
      <p className="agent-detail-finding">{agent.finding}</p>
      <div className="agent-trace">
        <div>
          <small>Input tables</small>
          <p>{agent.reads.join(", ")}</p>
        </div>
        <div>
          <small>TiDB query</small>
          <code>{agent.sql}</code>
        </div>
        <div>
          <small>Reasoning steps</small>
          <ol>
            {agent.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <small>Evidence</small>
          {agent.evidence.length > 0 ? (
            <ul>
              {agent.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No matching evidence.</p>
          )}
        </div>
        <div>
          <small>Writeback</small>
          <p>{agent.writes.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({ progress }) {
  const elapsedSeconds = ((progress?.elapsedMs || 0) / 1000).toFixed(1);
  return (
    <div className="progress-panel">
      <div className="progress-header">
        <strong>{progress?.stage || "Starting investigation"}</strong>
        <span>{elapsedSeconds}s</span>
      </div>
      <div className="progress-track">
        <i style={{ width: `${Math.min(96, 12 + (progress?.completed?.length || 0) * 16)}%` }} />
      </div>
      <div className="progress-detail">
        <span>
          Active: <strong>{progress?.activeAgent || "coordinator"}</strong>
        </span>
        <span>
          Done: <strong>{progress?.completed?.length || 0}</strong>
        </span>
        <span>
          Pending: <strong>{progress?.pending?.length || 0}</strong>
        </span>
      </div>
    </div>
  );
}

function DataLayerPanel({ analysis, repository }) {
  const tableGroups = [
    { name: "transactions", role: "payment events and historical activity" },
    { name: "customers", role: "profile, baseline behavior, risk tier" },
    { name: "merchants", role: "merchant profile and risk score" },
    { name: "risk_cases", role: "case queue and workflow status" },
    { name: "evidence_files", role: "device, payout, policy, and document evidence" },
    { name: "network_edges", role: "customer-device-account-merchant graph" },
    { name: "memory_events", role: "prior findings and recallable investigation memory" },
    { name: "agent_findings", role: "write-back output from each agent" }
  ];
  const writes = analysis?.agents?.flatMap((agent) => agent.writes) || [];
  return (
    <section className="panel data-layer-panel">
      <PanelTitle icon={<HardDrive size={18} />} title="TiDB Backend Storage" />
      <div className="data-story">
        <Database size={18} />
        <p>
          {repository === "tidb" ? "Live TiDB Zero backend is active. " : ""}
          TiDB keeps the transaction state, evidence, graph edges, workflow records, and agent memory in one SQL substrate.
        </p>
      </div>
      <div className="table-list">
        {tableGroups.map((table) => (
          <article key={table.name} className={writes.includes(table.name) ? "table-row write" : "table-row"}>
            <Table2 size={15} />
            <div>
              <strong>{table.name}</strong>
              <p>{table.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DossierPanel({ analysis, detail }) {
  return (
    <section className="panel dossier-panel">
      <PanelTitle icon={<AlertTriangle size={18} />} title="Risk Dossier" />
      {analysis ? (
        <>
          <div className={`score ${analysis.score >= 85 ? "critical" : analysis.score >= 65 ? "warning" : "normal"}`}>
            <span>{analysis.score}</span>
            <small>risk score</small>
          </div>
          <h3>{analysis.conclusion}</h3>
          <p>{analysis.recommendation}</p>
          <div className="dossier-flow">
            <span>{detail.customer.name}</span>
            <ArrowRight size={16} />
            <span>{detail.merchant.name}</span>
          </div>
        </>
      ) : (
        <p className="muted">No dossier yet. Agent output will appear here after investigation.</p>
      )}
    </section>
  );
}

function PanelTitle({ icon, title }) {
  return (
    <div className="panel-title">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function Metric({ label, value, sub }) {
  return (
    <div className="metric">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
