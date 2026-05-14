// Case List — air-traffic-control queue. Dense, scannable, alive.

// ── Realistic synthetic cases ──────────────────────────────────────────
// 30 cases, varied priorities/statuses/agents, the canonical Sarah Chen
// case at the top because that's the one the analyst will click into.
const QUEUE = [
  // priority, id, amount, currency, location, customer, tier, ageMin, status, agentProgress (cust, merch, net, pol — 0..1)
  { p: 'high', id: 'CASE-2461', amt: 4280.00, loc: 'Bali, ID',         cust: 'Sarah Chen',     tier: 'Premium',  age: 2,    status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'high', id: 'CASE-2460', amt: 1840.50, loc: 'Lagos, NG',        cust: 'David Kim',      tier: 'Standard', age: 5,    status: 'investigating', prog: [1.0, 0.72, 0.40, 0.20] },
  { p: 'high', id: 'CASE-2459', amt: 9120.00, loc: 'Bucharest, RO',    cust: 'Aiko Tanaka',    tier: 'Business', age: 7,    status: 'investigating', prog: [0.85, 1.0, 0.55, 0.0] },
  { p: 'high', id: 'CASE-2458', amt: 3400.00, loc: 'São Paulo, BR',    cust: 'Lucia Mendoza',  tier: 'Premium',  age: 11,   status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'med',  id: 'CASE-2457', amt: 420.00,  loc: 'Madrid, ES',       cust: 'Maria Lopez',    tier: 'Premium',  age: 12,   status: 'investigating', prog: [1.0, 1.0, 0.30, 0.0] },
  { p: 'high', id: 'CASE-2456', amt: 12500.00,loc: 'Manila, PH',       cust: 'Rohan Verma',    tier: 'Business', age: 14,   status: 'investigating', prog: [0.4, 0.10, 0.0, 0.0] },
  { p: 'med',  id: 'CASE-2455', amt: 78.00,   loc: 'San Francisco',    cust: 'Tom Hayashi',    tier: 'Standard', age: 14,   status: 'auto',          prog: [1, 1, 1, 1] },
  { p: 'high', id: 'CASE-2454', amt: 3100.00, loc: 'Buenos Aires, AR', cust: 'Anika Patel',    tier: 'Premium',  age: 21,   status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'med',  id: 'CASE-2453', amt: 220.00,  loc: 'New York, US',     cust: 'James OConnor',  tier: 'Standard', age: 34,   status: 'resolved',      prog: [1, 1, 1, 1] },
  { p: 'low',  id: 'CASE-2452', amt: 49.99,   loc: 'Austin, US',       cust: 'Priya Sharma',   tier: 'Standard', age: 41,   status: 'auto',          prog: [1, 1, 1, 1] },
  { p: 'high', id: 'CASE-2451', amt: 5980.00, loc: 'Dubai, AE',        cust: 'Mohamed Saleh',  tier: 'Business', age: 47,   status: 'investigating', prog: [1.0, 1.0, 1.0, 0.85] },
  { p: 'med',  id: 'CASE-2450', amt: 612.40,  loc: 'Berlin, DE',       cust: 'Lena Köhler',    tier: 'Premium',  age: 53,   status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'low',  id: 'CASE-2449', amt: 14.20,   loc: 'Chicago, US',      cust: 'Ben Carter',     tier: 'Standard', age: 58,   status: 'resolved',      prog: [1, 1, 1, 1] },
  { p: 'med',  id: 'CASE-2448', amt: 980.00,  loc: 'Mumbai, IN',       cust: 'Rahul Desai',    tier: 'Standard', age: 64,   status: 'investigating', prog: [0.7, 0.4, 0.0, 0.0] },
  { p: 'high', id: 'CASE-2447', amt: 4400.00, loc: 'Caracas, VE',      cust: 'Diego Romero',   tier: 'Premium',  age: 71,   status: 'resolved',      prog: [1, 1, 1, 1] },
  { p: 'low',  id: 'CASE-2446', amt: 8.50,    loc: 'Seattle, US',      cust: 'Kim Hayes',      tier: 'Standard', age: 78,   status: 'auto',          prog: [1, 1, 1, 1] },
  { p: 'med',  id: 'CASE-2445', amt: 1450.00, loc: 'Tokyo, JP',        cust: 'Yuki Watanabe',  tier: 'Premium',  age: 84,   status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'high', id: 'CASE-2444', amt: 7820.00, loc: 'Istanbul, TR',     cust: 'Selin Demir',    tier: 'Business', age: 89,   status: 'resolved',      prog: [1, 1, 1, 1] },
  { p: 'med',  id: 'CASE-2443', amt: 312.00,  loc: 'Toronto, CA',      cust: 'Adam Lee',       tier: 'Standard', age: 96,   status: 'awaiting',      prog: [1, 1, 1, 1] },
  { p: 'low',  id: 'CASE-2442', amt: 25.00,   loc: 'Phoenix, US',      cust: 'Ruth Coleman',   tier: 'Standard', age: 102,  status: 'auto',          prog: [1, 1, 1, 1] },
];

const TODAY = {
  resolved: 184,
  avgResolution: '1m 47s',
  approved: 142,
  flagged: 38,
  autoRes: 4,  // legacy
  patterns: [
    { name: 'Card-not-present geo anomaly', count: 38, trend: [3,5,4,7,6,9,7,8] },
    { name: 'Mule cluster RING-142',         count: 22, trend: [0,1,2,4,5,8,9,7] },
    { name: 'Account takeover · device new', count: 17, trend: [4,3,3,2,4,5,3,4] },
    { name: 'Friendly fraud · subscription', count: 11, trend: [2,3,2,3,2,3,4,3] },
  ],
  recentMem: [
    { t: '0:00', author: 'NETWORK',  text: 'cluster_match = RING-142 (0.91)' },
    { t: '0:00', author: 'MERCHANT', text: 'mch_BL_2904 cb_rate = 0.082' },
    { t: '0:01', author: 'CUSTOMER', text: 'm_8821 anomaly z=6.4' },
    { t: '0:02', author: 'POLICY',   text: 'reg_e §1005.11 → auto-hold' },
    { t: '0:04', author: 'NETWORK',  text: 'acq_K7H2 → cluster_RING_098' },
    { t: '0:08', author: 'CUSTOMER', text: 'm_3110 first-time intl txn' },
  ],
};

// Filter sections — counts are illustrative
const FILTERS = [
  { key: 'priority', title: 'Priority', items: [
    { v: 'high', label: 'High', count: 47, dot: 'var(--sig-danger)' },
    { v: 'med',  label: 'Medium', count: 86, dot: 'var(--sig-warn)' },
    { v: 'low',  label: 'Low', count: 114, dot: 'var(--text-3)' },
  ]},
  { key: 'status', title: 'Status', items: [
    { v: 'new',           label: 'New', count: 6 },
    { v: 'investigating', label: 'Investigating', count: 31 },
    { v: 'awaiting',      label: 'Awaiting review', count: 14 },
    { v: 'resolved',      label: 'Resolved', count: 184 },
    { v: 'auto',          label: 'Auto-resolved', count: 12 },
  ]},
  { key: 'time', title: 'Time range', items: [
    { v: '1h',    label: 'Last hour', count: 17 },
    { v: 'today', label: 'Today', count: 247 },
    { v: 'week',  label: 'This week', count: 1438 },
  ]},
  { key: 'tier', title: 'Customer tier', items: [
    { v: 'business', label: 'Business', count: 22 },
    { v: 'premium',  label: 'Premium', count: 89 },
    { v: 'standard', label: 'Standard', count: 136 },
  ]},
  { key: 'amount', title: 'Amount', items: [
    { v: 'gt5k',  label: '> $5,000', count: 19 },
    { v: '1k5k',  label: '$1,000 – $5,000', count: 47 },
    { v: '1001k', label: '$100 – $1,000', count: 88 },
    { v: 'lt100', label: '< $100', count: 93 },
  ]},
  { key: 'agent', title: 'Active agent', items: [
    { v: 'customer', label: 'Customer History', count: 31 },
    { v: 'merchant', label: 'Merchant Analysis', count: 28 },
    { v: 'network',  label: 'Network Graph',     count: 24 },
    { v: 'policy',   label: 'Policy Lookup',     count: 19 },
  ]},
];

// ── Components ─────────────────────────────────────────────────────────

function PriorityDot({ p }) {
  const c = p === 'high' ? 'var(--sig-danger)' : p === 'med' ? 'var(--sig-warn)' : 'var(--text-3)';
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 7, background: c }} />;
}

function fmtAmt(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAge(min) {
  if (min < 60) return min + 'm ago';
  const h = Math.floor(min / 60);
  return h + 'h ' + (min - h * 60) + 'm ago';
}

const AGENT_COLORS = {
  customer: 'var(--c-customer)',
  merchant: 'var(--c-merchant)',
  network: 'var(--c-network)',
  policy: 'var(--c-policy)',
};

// 4-segment mini progress bar — one per agent — for investigating rows
function AgentProgress({ prog }) {
  const keys = ['customer', 'merchant', 'network', 'policy'];
  return (
    <div style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }} title="customer · merchant · network · policy">
      {prog.map((p, i) => {
        const c = AGENT_COLORS[keys[i]];
        const active = p > 0 && p < 1;
        return (
          <div key={i} style={{
            position: 'relative',
            width: 22, height: 4, borderRadius: 2,
            background: 'var(--bg-3)',
            overflow: 'hidden',
          }}>
            <div className={active ? 'pulse-dot' : ''} style={{
              position: 'absolute', inset: 0, width: `${p * 100}%`,
              background: c, borderRadius: 2, transition: 'width .4s',
            }} />
          </div>
        );
      })}
    </div>
  );
}

function StatusCell({ status, prog }) {
  if (status === 'investigating') {
    const pct = Math.round((prog.reduce((a, b) => a + b, 0) / 4) * 100);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--sig-active)', flexShrink: 0 }} />
        <AgentProgress prog={prog} />
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 26 }}>{pct}%</span>
      </div>
    );
  }
  if (status === 'awaiting') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--sig-warn)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--sig-warn)', fontWeight: 600, letterSpacing: 0.4 }}>AWAITING REVIEW</span>
      </div>
    );
  }
  if (status === 'resolved') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--sig-ok)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--sig-ok)', fontWeight: 600, letterSpacing: 0.4 }}>RESOLVED</span>
      </div>
    );
  }
  if (status === 'auto') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--text-3)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.4 }}>AUTO-RESOLVED</span>
      </div>
    );
  }
  return null;
}

// Top banner — stack stats + KPIs
function TopBanner() {
  const Stat = ({ label, value, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: accent || 'var(--text-1)', letterSpacing: -0.2, marginTop: 2, fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '14px 20px',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: 'linear-gradient(135deg, var(--c-customer), var(--c-merchant))',
        }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-1)' }}>CLAIMS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6, marginTop: -1 }}>fraud + dispute ops</div>
        </div>
      </div>
      {/* Brand + KPIs only; stack stats (mem9/drive9/tidb) hidden until we find a better home for them. */}

      <div style={{ flex: 1 }} />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 22 }}>
        <Stat label="Active" value="247" />
        <Stat label="Avg resolve" value={TODAY.avgResolution} />
        <Stat label="Resolved today" value={TODAY.resolved} accent="var(--sig-ok)" />
      </div>

      {/* User */}
      <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 13,
          background: 'color-mix(in oklab, var(--c-customer) 18%, white)',
          color: 'var(--c-customer)', fontWeight: 600, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>MS</div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-1)', lineHeight: 1.1 }}>Maya Singh</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Senior analyst</div>
        </div>
      </div>
    </div>
  );
}

// Filter sidebar (collapsible)
function FilterRail() {
  const [open, setOpen] = React.useState({ priority: true, status: true, time: true, tier: true, amount: true, agent: true });
  const [sel, setSel] = React.useState({ priority: ['high', 'med', 'low'], status: ['new', 'investigating', 'awaiting'], time: ['today'] });
  const [collapsed, setCollapsed] = React.useState(false);
  const toggleOpen = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));
  const toggleSel = (group, v) => setSel(s => ({
    ...s,
    [group]: (s[group] || []).includes(v) ? (s[group] || []).filter(x => x !== v) : [...(s[group] || []), v],
  }));
  const activeCount = Object.values(sel).reduce((n, arr) => n + (arr ? arr.length : 0), 0);

  if (collapsed) {
    return (
      <aside style={{
        width: 40, minWidth: 40,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 0',
        minHeight: 0,
      }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Show filters"
          style={{
            width: 28, height: 28, padding: 0,
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: 5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-2)', position: 'relative',
          }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 3h8M3.5 6h5M5 9h2" />
          </svg>
          {activeCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              minWidth: 14, height: 14, padding: '0 3px', borderRadius: 7,
              background: 'var(--c-customer)', color: 'white',
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--bg-1)',
            }}>{activeCount}</span>
          )}
        </button>
        <div style={{ marginTop: 14, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-3)', letterSpacing: 1.4, fontWeight: 600,
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            transform: 'rotate(180deg)',
          }}>
            FILTERS · {activeCount} ACTIVE
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 220, minWidth: 220,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse"
            style={{
              width: 22, height: 22, padding: 0,
              background: 'transparent', border: 'none',
              borderRadius: 4, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-3)',
              marginLeft: -4,
            }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M8 2L4 6L8 10" />
            </svg>
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>FILTERS</span>
        </div>
        <button style={{
          fontSize: 10.5, color: 'var(--c-customer)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', padding: 0,
        }}>Reset</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {FILTERS.map(g => (
          <div key={g.key}>
            <button onClick={() => toggleOpen(g.key)} style={{
              width: '100%', textAlign: 'left',
              padding: '10px 14px', background: 'transparent', border: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600,
              color: 'var(--text-1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{g.title}</span>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="var(--text-3)" strokeWidth="1.5"
                   style={{ transform: open[g.key] ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .15s' }}>
                <path d="M2 3.5L4.5 6L7 3.5" strokeLinecap="round" />
              </svg>
            </button>
            {open[g.key] && (
              <div style={{ paddingBottom: 6 }}>
                {g.items.map(it => {
                  const checked = (sel[g.key] || []).includes(it.v);
                  return (
                    <label key={it.v} style={{
                      display: 'grid', gridTemplateColumns: '14px 1fr auto', columnGap: 8, alignItems: 'center',
                      padding: '5px 14px', cursor: 'pointer',
                      fontSize: 11.5, color: 'var(--text-2)',
                      minWidth: 0,
                    }}>
                      <span style={{
                        width: 13, height: 13, borderRadius: 3,
                        border: `1px solid ${checked ? 'var(--c-customer)' : 'var(--border-strong)'}`,
                        background: checked ? 'var(--c-customer)' : 'var(--bg-1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }} onClick={() => toggleSel(g.key, it.v)}>
                        {checked && <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.8"><path d="M1.5 4.5L3.5 6.5L7.5 2.5"/></svg>}
                      </span>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        minWidth: 0,
                        color: checked ? 'var(--text-1)' : 'var(--text-2)',
                      }}>
                        <span style={{
                          minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{it.label}</span>
                        {it.dot && (
                          <span style={{
                            width: 8, height: 8, borderRadius: 8,
                            background: it.dot,
                            flexShrink: 0,
                          }} />
                        )}
                      </span>
                      <span className="mono" style={{
                        fontSize: 10, color: 'var(--text-4)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>{it.count}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

// Right rail — Today's summary with tabs
function SummaryRail() {
  const [tab, setTab] = React.useState('summary');

  function Sparkline({ data, color }) {
    const w = 80, h = 18;
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <aside style={{
      width: 280, minWidth: 280,
      borderLeft: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        padding: '0 8px',
      }}>
        {[
          { v: 'summary',  label: 'Summary' },
          { v: 'system', label: 'System' },
        ].map(t => {
          const active = tab === t.v;
          return (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              padding: '10px 12px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 12, fontWeight: active ? 600 : 500,
              color: active ? 'var(--text-1)' : 'var(--text-3)',
              borderBottom: '2px solid ' + (active ? 'var(--text-1)' : 'transparent'),
              marginBottom: -1,
              transition: 'color .12s',
            }}>{t.label}</button>
          );
        })}
      </div>

      {tab === 'summary' ? <SummaryTab Sparkline={Sparkline} /> : <SystemTab />}
    </aside>
  );
}

function SummaryTab({ Sparkline }) {
  const [range, setRange] = React.useState('today');
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const RANGES = [
    { v: 'today',     label: 'Today',     mult: 1,    sub: 'Tue · May 12 · 04:18 PT' },
    { v: '7d',        label: '7 days',    mult: 7.2,  sub: 'May 6 – May 12' },
    { v: '30d',       label: '30 days',   mult: 30.4, sub: 'Apr 13 – May 12' },
    { v: 'qtd',       label: 'Quarter',   mult: 41.0, sub: 'Apr 1 – May 12' },
    { v: 'custom',    label: 'Custom…',   mult: 1,    sub: 'pick a window' },
  ];
  const r = RANGES.find(x => x.v === range);
  const slaPct = range === 'today' ? 94 : range === '7d' ? 92 : 91;
  const fmtK = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  const fmt = (n) => fmtK(Math.round(n * r.mult));

  // Hourly / daily volume — swap dataset by range
  const series = range === 'today'
    ? { data: [4,6,5,8,7,11,14,18,22,27,31,29,26,24,21,19,17,16,14,12,11,9,7,5], ticks: ['00','06','12','18','24'], nowIdx: 4, label: 'HOURLY VOLUME', unit: '/h' }
    : range === '7d'
      ? { data: [142, 168, 155, 189, 201, 178, 184], ticks: ['Wed','Thu','Fri','Sat','Sun','Mon','Tue'], nowIdx: 6, label: 'DAILY VOLUME', unit: '/d' }
      : { data: Array.from({length: 30}, (_, i) => 120 + Math.round(60 * Math.sin(i/4)) + (i % 7 === 5 ? 30 : 0)), ticks: ['Apr 13','Apr 20','Apr 27','May 4','May 12'], nowIdx: 29, label: 'DAILY VOLUME', unit: '/d' };
  const peak = Math.max(...series.data);

  // Close picker when clicking outside
  const pickerRef = React.useRef(null);
  React.useEffect(() => {
    if (!rangeOpen) return;
    const onDoc = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setRangeOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [rangeOpen]);

  return (
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {/* Range selector */}
      <div style={{ padding: '12px 16px', position: 'relative' }} ref={pickerRef}>
        <button onClick={() => setRangeOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px', marginLeft: -8,
          background: rangeOpen ? 'var(--bg-2)' : 'transparent',
          border: '1px solid ' + (rangeOpen ? 'var(--border)' : 'transparent'),
          borderRadius: 5, cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.1 }}>{r.label}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2.5 4L5 6.5L7.5 4" />
          </svg>
        </button>
        <div style={{ marginTop: 2, marginLeft: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{r.sub}</div>

        {rangeOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 10, marginTop: 2,
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            boxShadow: 'var(--shadow-2)',
            padding: 4,
            minWidth: 160,
            zIndex: 10,
          }}>
            {RANGES.map(opt => (
              <button key={opt.v} onClick={() => { setRange(opt.v); setRangeOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 10px', borderRadius: 4,
                background: range === opt.v ? 'var(--bg-2)' : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 12,
                color: range === opt.v ? 'var(--text-1)' : 'var(--text-2)',
                fontWeight: range === opt.v ? 600 : 500,
              }}>{opt.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* KPI grid */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
          {[
            { l: 'RESOLVED', v: fmt(TODAY.resolved), c: 'var(--text-1)' },
            { l: 'AVG RESOLVE', v: TODAY.avgResolution, c: 'var(--text-1)' },
            { l: 'APPROVED', v: fmt(TODAY.approved), c: 'var(--sig-ok)' },
            { l: 'FLAGGED', v: fmt(TODAY.flagged), c: 'var(--sig-danger)' },
          ].map(k => (
            <div key={k.l} style={{ background: 'var(--bg-1)', padding: '10px 12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6 }}>{k.l}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: k.c, marginTop: 3 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Performance */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>SLA PERFORMANCE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: slaPct >= 90 ? 'var(--sig-ok)' : 'var(--sig-warn)' }}>{slaPct}%</span>
        </div>
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-3)' }}>
          <div style={{ width: `${slaPct}%`, background: 'var(--sig-ok)' }} />
          <div style={{ flex: 1, background: 'var(--sig-danger)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-3)' }}>
          <span>Within 2:00 SLA</span>
          <span className="mono" style={{ color: 'var(--text-4)' }}>{fmt(TODAY.resolved - 11)} / {fmt(TODAY.resolved)}</span>
        </div>
      </div>

      {/* Volume chart */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>{series.label}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>peak {peak}{series.unit}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 42 }}>
          {series.data.map((h, i) => {
            const isNow = i === series.nowIdx;
            const isPeak = h === peak;
            return (
              <div key={i} style={{
                flex: 1, height: `${(h / peak) * 100}%`,
                background: isNow ? 'var(--c-customer)' : isPeak ? 'var(--text-2)' : 'var(--border-strong)',
                borderRadius: 1,
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-4)' }}>
          {series.ticks.map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* Top fraud patterns */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>TOP FRAUD PATTERNS</span>
        <div style={{ marginTop: 10 }}>
          {TODAY.patterns.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', padding: '6px 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-1)' }}>{p.name}</span>
              <Sparkline data={p.trend} color="var(--c-network)" />
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)', minWidth: 22, textAlign: 'right' }}>{fmt(p.count)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My decisions */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>MY DECISIONS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)' }}>{r.label.toLowerCase()}</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{fmt(27)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Approved</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{fmt(4)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Rejected</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{fmt(2)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Escalated</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  return (
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      {/* Intro */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>POWERED BY</span>
        <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
          One TiDB Cloud cluster runs the application, the agent runtime, and the data plane — no Pinecone + Postgres + ClickHouse + Redis stitching.
        </div>
      </div>

      {/* Stack stats */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>STACK</span>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StackRow name="mem9" desc="shared memory · vector + facts" value="4.2M" sub="entries" />
          <StackRow name="drive9" desc="evidence file store" value="1.8M" sub="files · 28 GB" />
          <StackRow name="tidb" desc="OLTP · TiFlash · vector" value="487M" sub="txns indexed" />
        </div>
        <a href="Stack Detail.html" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 12, padding: '5px 9px',
          background: 'var(--bg-2)', border: '1px solid var(--border-subtle)', borderRadius: 5,
          color: 'var(--text-1)', fontSize: 11, fontWeight: 500,
          textDecoration: 'none', fontFamily: 'var(--font-sans)',
        }}>
          See stack detail
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 2L6 4.5L3 7" />
          </svg>
        </a>
      </div>

      {/* Live writes */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>mem9 · LIVE WRITES</span>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--sig-active)' }} />
        </div>
        <div style={{ marginTop: 8 }}>
          {TODAY.recentMem.map((m, i) => (
            <div key={i} className="row-in" style={{ padding: '6px 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: 'var(--text-2)', letterSpacing: 0.5 }}>{m.author}</span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)' }}>{m.t} ago</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-1)', marginTop: 2 }}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StackRow({ name, desc, value, sub }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'baseline' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{name}</div>
        <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{desc}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

// Queue table
function QueueTable({ onOpen }) {
  const [sort, setSort] = React.useState('priority');
  const [hovered, setHovered] = React.useState(null);
  const sorted = [...QUEUE].sort((a, b) => {
    if (sort === 'priority') {
      const r = { high: 0, med: 1, low: 2 };
      return r[a.p] - r[b.p];
    }
    if (sort === 'newest') return a.age - b.age;
    if (sort === 'oldest') return b.age - a.age;
    if (sort === 'amount') return b.amt - a.amt;
    if (sort === 'tier') {
      const r = { Business: 0, Premium: 1, Standard: 2 };
      return r[a.tier] - r[b.tier];
    }
    return 0;
  });

  const Header = ({ children, value, w, right }) => (
    <button onClick={() => value && setSort(value)} style={{
      display: 'flex', alignItems: 'center', justifyContent: right ? 'flex-end' : 'flex-start',
      gap: 4,
      padding: '8px 12px',
      background: 'transparent', border: 'none', cursor: value ? 'pointer' : 'default',
      fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
      color: sort === value ? 'var(--text-1)' : 'var(--text-3)', letterSpacing: 1,
      width: w, flexShrink: 0, textAlign: right ? 'right' : 'left',
      borderRight: '1px solid var(--border-subtle)',
    }}>
      <span>{children}</span>
      {sort === value && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3l2 2 2-2"/></svg>}
    </button>
  );

  return (
    <main style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      minHeight: 0, minWidth: 0,
      background: 'var(--bg-0)',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.2 }}>Queue</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>· 247 active</span>
        </div>
        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 360,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 5,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.6">
            <circle cx="6" cy="6" r="4.5" /><path d="M9.5 9.5L12.5 12.5" strokeLinecap="round" />
          </svg>
          <input placeholder="Search by case ID, customer, merchant…"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 11.5, color: 'var(--text-1)', flex: 1, fontFamily: 'inherit' }} />
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)', padding: '1px 5px', border: '1px solid var(--border-subtle)', borderRadius: 3 }}>⌘K</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Sort — segmented control */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: 2, gap: 2,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 7,
        }}>
          {[
            { v: 'priority', label: 'Priority' },
            { v: 'newest', label: 'Newest' },
            { v: 'amount', label: 'Amount' },
            { v: 'tier', label: 'Tier' },
          ].map(o => {
            const active = sort === o.v;
            return (
              <button key={o.v} onClick={() => setSort(o.v)}
                style={{
                  padding: '4px 10px', borderRadius: 5,
                  background: active ? 'var(--bg-1)' : 'transparent',
                  border: '1px solid ' + (active ? 'var(--border)' : 'transparent'),
                  boxShadow: active ? '0 1px 1px rgba(10,31,68,0.04)' : 'none',
                  color: active ? 'var(--text-1)' : 'var(--text-3)',
                  fontFamily: 'var(--font-sans)', fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'color .12s',
                }}>{o.label}</button>
            );
          })}
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '24px 90px 1fr 110px 130px 200px 80px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ padding: '8px 0', borderRight: '1px solid var(--border-subtle)' }} />
        <Header value="priority" w="100%">CASE</Header>
        <Header w="100%">DETAILS</Header>
        <Header value="amount" w="100%" right>AMOUNT</Header>
        <Header value="tier" w="100%">CUSTOMER</Header>
        <Header w="100%">STATUS</Header>
        <Header value="newest" w="100%" right>AGE</Header>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sorted.map((c, i) => {
          const isFirst = i === 0;
          return (
            <div key={c.id}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onOpen && onOpen(c)}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 90px 1fr 110px 130px 200px 80px',
                alignItems: 'center',
                background: isFirst ? 'color-mix(in oklab, var(--sig-active) 5%, var(--bg-1))' : (hovered === c.id ? 'var(--bg-2)' : 'var(--bg-1)'),
                borderLeft: isFirst ? '2px solid var(--sig-active)' : '2px solid transparent',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                fontSize: 12,
                position: 'relative',
              }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PriorityDot p={c.p} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 500 }}>{c.id}</span>
              </div>
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.loc}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>03:14:24 PT · txn_{c.id.slice(-4)}…</span>
              </div>
              <div style={{ padding: '10px 12px', textAlign: 'right' }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: c.amt >= 1000 ? 'var(--text-1)' : 'var(--text-2)' }}>{fmtAmt(c.amt)}</span>
              </div>
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ color: 'var(--text-1)' }}>{c.cust}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.tier}</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <StatusCell status={c.status} prog={c.prog} />
              </div>
              <div style={{ padding: '10px 12px', textAlign: 'right' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtAge(c.age)}</span>
              </div>

              {/* Hover preview tooltip */}
              {hovered === c.id && c.status === 'investigating' && (
                <div style={{
                  position: 'absolute', right: 12, top: '100%',
                  zIndex: 5,
                  marginTop: 4,
                  width: 320,
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-pop)',
                  padding: 12,
                  pointerEvents: 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{c.id}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>preview</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>
                    {c.cust} · {c.tier}<br/>
                    {fmtAmt(c.amt)} at {c.loc}<br/>
                    {c.age}m elapsed · 4 agents working
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {['customer','merchant','network','policy'].map((k, j) => (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 30px', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: AGENT_COLORS[k], letterSpacing: 0.5 }}>{k.toUpperCase()}</span>
                        <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.prog[j] * 100}%`, background: AGENT_COLORS[k], transition: 'width .4s' }} />
                        </div>
                        <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'right' }}>{Math.round(c.prog[j] * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--text-3)',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>Showing {sorted.length} of 247</span>
        <span>↑↓ navigate · ↵ open · ⌘F filter</span>
      </div>
    </main>
  );
}

// Full screen
function CaseList({ onOpen }) {
  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <TopBanner />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <FilterRail />
        <QueueTable onOpen={onOpen} />
        <SummaryRail />
      </div>
    </div>
  );
}

Object.assign(window, { CaseList, QUEUE, TODAY });
