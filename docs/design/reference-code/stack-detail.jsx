// Stack Detail — the "one cluster" rhetorical climax screen.
// Three layers, animated flow between them, live tickers.

const { useState, useEffect, useRef } = React;

// ── Live tickers ──────────────────────────────────────────────────────
function useTicker(initial, perTick, jitter = 0.3, intervalMs = 600) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      const j = (Math.random() - 0.5) * 2 * jitter;
      setV(prev => prev + Math.max(0, Math.round(perTick * (1 + j))));
    }, intervalMs);
    return () => clearInterval(id);
  }, []);
  return v;
}

function useRate(min, max, intervalMs = 800) {
  const [v, setV] = useState((min + max) / 2);
  useEffect(() => {
    const id = setInterval(() => setV(min + Math.random() * (max - min)), intervalMs);
    return () => clearInterval(id);
  }, []);
  return v;
}

// ── Top banner — same DNA as other screens ────────────────────────────
function TopBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '14px 24px',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--c-customer), var(--c-merchant))' }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-1)' }}>CLAIMS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6, marginTop: -1 }}>fraud + dispute ops</div>
        </div>
      </div>
      <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
        <a href="Case List.html" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Cases</a>
        <span>/</span>
        <a href="Case Detail.html" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>CASE-2461</a>
        <span>/</span>
        <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>Stack</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-2)', border: '1px solid var(--border-subtle)', borderRadius: 5 }}>
        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--sig-ok)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-2)', letterSpacing: 0.5 }}>CLUSTER HEALTHY · us-west-2</span>
      </div>
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────
function ScreenHeader() {
  return (
    <div style={{
      padding: '28px 32px 20px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 1, fontWeight: 600 }}>SYSTEM ARCHITECTURE</div>
        <h1 style={{ margin: '8px 0 6px', fontSize: 32, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.6, lineHeight: 1.1 }}>
          One stack. One cluster.
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', maxWidth: 640, lineHeight: 1.5 }}>
          The application, the agent runtime, and the data plane all run on a single TiDB Cloud cluster.
          No Pinecone + Postgres + ClickHouse + Redis to stitch together.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-mono)' }}>
        <Kpi label="LAYERS" value="3" />
        <Kpi label="CLUSTERS" value="1" accent="var(--sig-ok)" />
        <Kpi label="INTEGRATIONS" value="0" accent="var(--sig-ok)" />
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: accent || 'var(--text-1)', marginTop: 4, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

// ── Layer chrome ──────────────────────────────────────────────────────
function LayerHeader({ tag, title, subtitle, side, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2,
        color: color, padding: '3px 8px',
        border: `1px solid ${color}`,
        borderRadius: 3,
        background: `color-mix(in oklab, ${color} 6%, white)`,
      }}>{tag}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.2 }}>{title}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{subtitle}</span>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.5 }}>{side}</div>
    </div>
  );
}

// ── L1 — Application miniature ────────────────────────────────────────
function AgentChip({ name, color, status }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 8px', borderRadius: 4,
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      minWidth: 0,
    }}>
      <span className={status === 'WORKING' ? 'pulse-dot' : ''} style={{ width: 6, height: 6, borderRadius: 6, background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: 'var(--text-2)', letterSpacing: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
    </div>
  );
}

function ApplicationLayer() {
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 18,
      boxShadow: 'var(--shadow-1)',
      position: 'relative',
    }}>
      <LayerHeader
        tag="L1"
        title="CLAIMS application"
        subtitle="analyst-facing console — case detail, queue, dispute flow"
        side="React · TypeScript · WebSocket"
        color="var(--c-customer)"
      />

      {/* Mini investigation pod render */}
      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        padding: 14,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-1)', letterSpacing: 0.5 }}>CASE-2461 · Sarah Chen</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--sig-danger)' }}>$4,280 · Bali, ID</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)' }}>02:14 elapsed</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <AgentChip name="CUSTOMER · DONE" color="var(--c-customer)" status="DONE" />
          <AgentChip name="MERCHANT · DONE" color="var(--c-merchant)" status="DONE" />
          <AgentChip name="NETWORK · WORK" color="var(--c-network)" status="WORKING" />
          <AgentChip name="POLICY · WAIT" color="var(--c-policy)" status="IDLE" />
        </div>

        {/* progress strip */}
        <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
          {['var(--c-customer)','var(--c-merchant)','var(--c-network)','var(--c-policy)'].map((c, i) => {
            const fills = [1, 1, 0.88, 0.6];
            return (
              <div key={i} style={{ flex: 1, height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${fills[i] * 100}%`, background: c, transition: 'width .4s' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Side metric */}
      <div style={{
        position: 'absolute', top: 18, right: 18,
        display: 'flex', gap: 18,
      }}>
        <SideStat label="ACTIVE CASES" value="247" />
        <SideStat label="ANALYSTS" value="34" />
      </div>
    </div>
  );
}

function SideStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: color || 'var(--text-1)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ── L2 — Agent platform: mem9 + drive9 ────────────────────────────────
function Mem9Module() {
  const writes = useTicker(4_201_847, 12, 0.5, 700);
  const reads = useTicker(18_402_551, 38, 0.5, 700);
  const ratePerSec = useRate(11, 18);

  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.2 }}>mem9</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>shared memory</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 12 }}>vector + structured facts agents read & write into</div>

      {/* big counters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Counter label="ENTRIES" value={writes.toLocaleString()} sub="rows" />
        <Counter label="READS / SEC" value={ratePerSec.toFixed(1) + 'k'} sub="across agents" accent="var(--c-customer)" />
      </div>

      {/* sparkbar — write activity per second over last 30s */}
      <SparkBars seed="mem9" color="var(--c-customer)" />

      {/* recent writes ticker */}
      <RecentWrites />
    </div>
  );
}

function Drive9Module() {
  const files = useTicker(1_802_441, 1, 1, 1100);
  const sizeMB = useTicker(28491, 0.4, 0.6, 1100);

  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 16,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.2 }}>drive9</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>evidence pack store</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 12 }}>structured files agents emit per case</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Counter label="FILES" value={files.toLocaleString()} sub="all-time" />
        <Counter label="SIZE" value={(sizeMB / 1000).toFixed(1) + ' GB'} sub="indexed" accent="var(--c-merchant)" />
      </div>

      <SparkBars seed="drive9" color="var(--c-merchant)" />

      {/* recent files */}
      <RecentFiles />
    </div>
  );
}

function Counter({ label, value, sub, accent }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '8px 10px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: accent || 'var(--text-1)', marginTop: 3, letterSpacing: -0.3 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// 30 bars representing per-second activity. Slides left every tick.
function SparkBars({ seed, color }) {
  const [bars, setBars] = useState(() => Array.from({ length: 32 }, () => 0.2 + Math.random() * 0.8));
  useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => [...prev.slice(1), 0.25 + Math.random() * 0.7]);
    }, 600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26, marginBottom: 10 }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${Math.max(8, b * 100)}%`,
          background: i === bars.length - 1 ? color : `color-mix(in oklab, ${color} 45%, white)`,
          borderRadius: 1,
          transition: 'height .3s',
        }} />
      ))}
    </div>
  );
}

const MEM_STREAM = [
  { agent: 'NETWORK',  text: 'cluster_match RING-142 (0.91)' },
  { agent: 'CUSTOMER', text: 'm_8821 anomaly z=6.4' },
  { agent: 'MERCHANT', text: 'mch_BL_2904 cb_rate 0.082' },
  { agent: 'POLICY',   text: 'reg_e §1005.11 → auto-hold' },
  { agent: 'CUSTOMER', text: 'sarah.geo no intl since 2019' },
  { agent: 'NETWORK',  text: 'acq_K7H2 → cluster_RING_098' },
  { agent: 'MERCHANT', text: 'mch_LA_3010 dispute_24h 17' },
  { agent: 'POLICY',   text: 'cardholder_zero_liab applies' },
];
const AGENT_C = {
  CUSTOMER: 'var(--c-customer)',
  MERCHANT: 'var(--c-merchant)',
  NETWORK:  'var(--c-network)',
  POLICY:   'var(--c-policy)',
};
function RecentWrites() {
  const [head, setHead] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHead(h => h + 1), 1200);
    return () => clearInterval(id);
  }, []);
  const visible = Array.from({ length: 4 }, (_, i) => MEM_STREAM[(head + i) % MEM_STREAM.length]);
  return (
    <div style={{ flex: 1, overflow: 'hidden', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, marginBottom: 6 }}>RECENT WRITES</div>
      {visible.map((m, i) => (
        <div key={head + '-' + i} className="row-in" style={{ display: 'flex', gap: 8, padding: '3px 0', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: AGENT_C[m.agent], letterSpacing: 0.5, minWidth: 60 }}>{m.agent}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.text}</span>
        </div>
      ))}
    </div>
  );
}

const FILE_STREAM = [
  { name: 'customer_pattern_anomaly.md', case: '2461', agent: 'CUSTOMER' },
  { name: 'merchant_risk_report.md',     case: '2461', agent: 'MERCHANT' },
  { name: 'network_graph.json',          case: '2461', agent: 'NETWORK'  },
  { name: 'policy_match.md',             case: '2459', agent: 'POLICY'   },
  { name: 'recommendation.md',           case: '2459', agent: 'POLICY'   },
  { name: 'device_fingerprint.json',     case: '2454', agent: 'NETWORK'  },
  { name: 'transaction_history.csv',     case: '2451', agent: 'CUSTOMER' },
  { name: 'merchant_chargeback_chain.md',case: '2456', agent: 'MERCHANT' },
];
function RecentFiles() {
  const [head, setHead] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHead(h => h + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const visible = Array.from({ length: 4 }, (_, i) => FILE_STREAM[(head + i) % FILE_STREAM.length]);
  return (
    <div style={{ flex: 1, overflow: 'hidden', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, marginBottom: 6 }}>RECENT FILES</div>
      {visible.map((f, i) => (
        <div key={head + '-' + i} className="row-in" style={{ display: 'grid', gridTemplateColumns: '12px 1fr 60px', gap: 6, padding: '3px 0', alignItems: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={AGENT_C[f.agent]} strokeWidth="1.4">
            <path d="M3 1.5h4l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-7a1 1 0 011-1z" />
            <path d="M7 1.5v2h2" />
          </svg>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', textAlign: 'right' }}>CASE-{f.case}</span>
        </div>
      ))}
    </div>
  );
}

function AgentRuntimeStrip() {
  const agents = [
    { key: 'customer', name: 'Customer History', color: 'var(--c-customer)' },
    { key: 'merchant', name: 'Merchant Analysis', color: 'var(--c-merchant)' },
    { key: 'network',  name: 'Network Graph',     color: 'var(--c-network)'  },
    { key: 'policy',   name: 'Policy Lookup',     color: 'var(--c-policy)'   },
  ];
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 16,
      marginBottom: 12,
    }}>
      <div style={{ minWidth: 130 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>AGENT RUNTIME</div>
        <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500, marginTop: 2 }}>4 specialists</div>
      </div>
      <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
      <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
        {agents.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', border: '1px solid var(--border-subtle)', borderRadius: 4, background: 'var(--bg-2)' }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: 7, background: a.color }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-1)' }}>{a.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.4 }}>· running</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <SideStat label="CONCURRENCY" value="8.2k" color="var(--c-customer)" />
        <SideStat label="P50 LATENCY" value="34ms" />
      </div>
    </div>
  );
}

function AgentPlatformLayer() {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <LayerHeader
          tag="L2"
          title="Agent platform"
          subtitle="mem9 shared memory · drive9 evidence files · 4-agent runtime"
          side="Python · vector embed · tool-calling"
          color="var(--c-merchant)"
        />
      </div>
      <AgentRuntimeStrip />
      <div style={{ display: 'flex', gap: 12 }}>
        <Mem9Module />
        <Drive9Module />
      </div>
    </div>
  );
}

// ── L3 — TiDB Cloud cluster (the punchline) ───────────────────────────
function TiDBLayer() {
  const txnPerSec = useRate(38_400, 52_000);
  const vecPerSec = useRate(8_200, 11_400);
  const scanPerSec = useRate(180, 320);

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 18,
      boxShadow: 'var(--shadow-2)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* foundation gradient — soft, almost imperceptible */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--c-policy) 4%, transparent) 100%)',
      }} />

      <div style={{ position: 'relative' }}>
        <LayerHeader
          tag="L3"
          title="TiDB Cloud"
          subtitle="one cluster — OLTP + analytics + vector — no integrations"
          side="Serverless · multi-AZ · us-west-2"
          color="var(--c-policy)"
        />

        {/* Punchline annotation */}
        <div style={{
          padding: '8px 12px',
          background: 'color-mix(in oklab, var(--sig-ok) 8%, white)',
          border: '1px solid color-mix(in oklab, var(--sig-ok) 25%, white)',
          borderRadius: 6,
          marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--sig-ok)" strokeWidth="1.6">
            <path d="M2 7l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--text-1)' }}>
            Row store, columnar analytics, and vector search run on the <strong style={{ color: 'var(--sig-ok)' }}>same cluster</strong>. No Pinecone + Postgres + ClickHouse + Redis stitching.
          </span>
        </div>

        {/* Three workload cards inside one cluster outline */}
        <ClusterOutline>
          <WorkloadCard
            tag="ROW STORE · TiKV"
            title="OLTP transactions"
            big={Math.round(txnPerSec).toLocaleString() + ' /s'}
            sub="card auths · settlements · ledger writes"
            color="var(--c-customer)"
            stats={[
              ['p50 read', '1.2ms'],
              ['p99 read', '8.4ms'],
              ['regions', '3'],
            ]}
          />
          <WorkloadCard
            tag="COLUMNAR · TiFlash"
            title="Real-time analytics"
            big={Math.round(scanPerSec) + ' scans/s'}
            sub="customer pattern queries · merchant aggregates"
            color="var(--c-network)"
            stats={[
              ['p50 scan', '42ms'],
              ['fresh.', '< 1s'],
              ['HTAP', 'on'],
            ]}
          />
          <WorkloadCard
            tag="VECTOR INDEX"
            title="Similarity search"
            big={Math.round(vecPerSec).toLocaleString() + ' /s'}
            sub="mem9 fact retrieval · case similarity"
            color="var(--c-merchant)"
            stats={[
              ['dim', '1536'],
              ['recall@10', '98.2%'],
              ['HNSW', 'on'],
            ]}
          />
        </ClusterOutline>

        {/* Topology + summary */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <Topology />
          <ClusterSummary />
        </div>
      </div>
    </div>
  );
}

function ClusterOutline({ children }) {
  return (
    <div style={{
      position: 'relative',
      border: '1.5px dashed color-mix(in oklab, var(--c-policy) 35%, white)',
      borderRadius: 8,
      padding: 14,
      background: 'color-mix(in oklab, var(--c-policy) 2.5%, white)',
    }}>
      <div style={{
        position: 'absolute', top: -9, left: 14,
        padding: '2px 8px',
        background: 'var(--bg-1)',
        fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
        color: 'var(--c-policy)', letterSpacing: 1,
      }}>
        ONE CLUSTER · cluster_id=tidb-prod-01
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function WorkloadCard({ tag, title, big, sub, color, stats }) {
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      padding: 12,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 0.8, color: color, marginBottom: 6 }}>{tag}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: color, letterSpacing: -0.5, marginTop: 6 }}>{big}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        {stats.map(([l, v], i) => (
          <div key={i}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.5 }}>{l.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-1)', marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Topology() {
  // 9 nodes laid out in 3x3 — colored by region. Subtle pulses to suggest replication.
  const nodes = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      nodes.push({ r, c, region: ['us-west-2a','us-west-2b','us-west-2c'][r] });
    }
  }
  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>TOPOLOGY</div>
        <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500, marginTop: 2 }}>9 nodes · 3 AZ</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', marginTop: 4 }}>raft-replicated</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {nodes.map((n, i) => {
          const color = ['var(--c-customer)', 'var(--c-merchant)', 'var(--c-network)'][n.r];
          return (
            <div key={i} className="pulse-dot" style={{
              width: 14, height: 14, borderRadius: 3,
              background: color, opacity: 0.85,
              animationDelay: `${i * 0.13}s`,
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)' }}>
        <span><span style={{ display:'inline-block', width: 7, height: 7, borderRadius: 2, background: 'var(--c-customer)', marginRight: 5 }}/>us-west-2a</span>
        <span><span style={{ display:'inline-block', width: 7, height: 7, borderRadius: 2, background: 'var(--c-merchant)', marginRight: 5 }}/>us-west-2b</span>
        <span><span style={{ display:'inline-block', width: 7, height: 7, borderRadius: 2, background: 'var(--c-network)', marginRight: 5 }}/>us-west-2c</span>
      </div>
    </div>
  );
}

function ClusterSummary() {
  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      padding: '10px 14px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'center',
    }}>
      <SideStat label="STORAGE" value="2.4 TB" />
      <SideStat label="CPU" value="38%" />
      <SideStat label="UPTIME" value="99.99%" color="var(--sig-ok)" />
      <SideStat label="RPO" value="0s" color="var(--sig-ok)" />
    </div>
  );
}

// ── Connectors between layers ─────────────────────────────────────────
// Vertical SVG that sits between layers with animated dots flowing down,
// labels for what's flowing.
function Connector({ from, to, labels, height = 60 }) {
  return (
    <div style={{
      height,
      position: 'relative',
      margin: '0 32px',
    }}>
      <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`grad-${from}-${to}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`color-mix(in oklab, ${from} 40%, transparent)`} />
            <stop offset="1" stopColor={`color-mix(in oklab, ${to} 40%, transparent)`} />
          </linearGradient>
        </defs>
        {[0.18, 0.42, 0.66, 0.86].map((x, i) => (
          <g key={i}>
            <line
              x1={`${x * 100}%`} y1="0"
              x2={`${x * 100}%`} y2={height}
              stroke={`url(#grad-${from}-${to})`}
              strokeWidth="1.2"
              strokeDasharray="3 4"
              className="flow-line"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <circle cx={`${x * 100}%`} cy="0" r="3" fill={from}>
              <animate attributeName="cy" from="0" to={height} dur={`${1.4 + i * 0.2}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
              <animate attributeName="opacity" values="0;1;1;0" dur={`${1.4 + i * 0.2}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
          </g>
        ))}
      </svg>
      {/* Labels */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        pointerEvents: 'none',
      }}>
        {labels.map((l, i) => (
          <span key={i} className="mono" style={{
            fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.4,
            background: 'var(--bg-0)', padding: '2px 6px', borderRadius: 3,
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'nowrap',
          }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ── Footer punchline ──────────────────────────────────────────────────
function Punchline() {
  const events = useRate(60_000, 78_000);
  return (
    <div style={{
      margin: '24px 32px 32px',
      padding: '16px 20px',
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="pulse-dot" style={{ width: 10, height: 10, borderRadius: 10, background: 'var(--sig-ok)' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            <span className="mono" style={{ color: 'var(--sig-ok)' }}>{Math.round(events).toLocaleString()}</span> events / sec flowing through one TiDB cluster
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>across L1 application traffic, L2 agent reads/writes, and L3 vector + analytical queries</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <SideStat label="VENDORS REPLACED" value="4" color="var(--sig-ok)" />
        <SideStat label="MOVING PARTS" value="1" color="var(--sig-ok)" />
        <SideStat label="ETL PIPELINES" value="0" color="var(--sig-ok)" />
      </div>
    </div>
  );
}

// ── Compose ───────────────────────────────────────────────────────────
function StackDetail() {
  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-0)' }}>
      <TopBanner />
      <ScreenHeader />

      <div style={{ padding: '0 32px' }}>
        <ApplicationLayer />
      </div>

      <Connector
        from="var(--c-customer)" to="var(--c-merchant)"
        labels={['analyst events', 'case opens', 'approvals', 'WebSocket frames']}
      />

      <div style={{ padding: '0 32px' }}>
        <AgentPlatformLayer />
      </div>

      <Connector
        from="var(--c-merchant)" to="var(--c-policy)"
        labels={['vector reads', 'fact writes', 'file blobs', 'time-range scans']}
        height={70}
      />

      <div style={{ padding: '0 32px' }}>
        <TiDBLayer />
      </div>

      <Punchline />
    </div>
  );
}

Object.assign(window, { StackDetail });
