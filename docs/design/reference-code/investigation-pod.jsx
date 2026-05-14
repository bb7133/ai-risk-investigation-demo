// Investigation Pod — center 40% of Case Detail. 2x2 agent grid + center mem9 hub.

const POD_AGENTS = {
  customer: {
    id: 'customer', name: 'Customer History', short: 'CUST',
    color: 'var(--c-customer)', tint: 'var(--tint-customer)',
    glyph: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
  },
  merchant: {
    id: 'merchant', name: 'Merchant Analysis', short: 'MERCH',
    color: 'var(--c-merchant)', tint: 'var(--tint-merchant)',
    glyph: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6h12l-1 8H3z" /><path d="M5 6V4a3 3 0 016 0v2" />
      </svg>
    ),
  },
  network: {
    id: 'network', name: 'Network Graph', short: 'NET',
    color: 'var(--c-network)', tint: 'var(--tint-network)',
    glyph: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="3" r="1.6" /><circle cx="3" cy="12" r="1.6" /><circle cx="13" cy="12" r="1.6" /><path d="M8 4.6L4 10.8M8 4.6l4 6.2M5 12.5h6" />
      </svg>
    ),
  },
  policy: {
    id: 'policy', name: 'Policy Lookup', short: 'POL',
    color: 'var(--c-policy)', tint: 'var(--tint-policy)',
    glyph: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2h7l3 3v9H3z" /><path d="M5.5 7.5h5M5.5 10h5M5.5 5h2.5" />
      </svg>
    ),
  },
};

// Trace entries — same scenario data, refined kinds
const POD_TRACES = {
  customer: {
    activity: 'Cross-checking 8-year transaction pattern',
    tool: { name: 'tidb.txn_history', q: 'WHERE member_id = m_8821' },
    trace: [
      { t: '0:02', k: 'thought', text: 'Pulling card history for m_8821 (Sarah Chen).' },
      { t: '0:06', k: 'result', text: '4,127 txns. Last intl: 2019-04-12 CDG.' },
      { t: '0:11', k: 'thought', text: 'Customer mean ticket $84, hours 09:00–22:00 PT.' },
      { t: '0:15', k: 'result', text: 'z(amount)=6.4, z(hour)=4.1, geo novel.' },
    ],
    findings: [
      { sev: 'high', text: 'No international travel since 2019' },
      { sev: 'high', text: 'Amount 51× customer median' },
      { sev: 'med',  text: 'Off-pattern hour (03:14 PT)' },
    ],
    status: 'done',
  },
  merchant: {
    activity: 'Profiling merchant + chargeback history',
    tool: { name: 'tidb.merchants', q: 'JOIN disputes USING (merchant_id)' },
    trace: [
      { t: '0:02', k: 'thought', text: 'Resolving mch_BL_2904 (PT Sunset Holdings).' },
      { t: '0:07', k: 'result', text: 'MCC 7995 · 7-month registration.' },
      { t: '0:13', k: 'result', text: 'Chargeback rate 8.2% (industry p99 = 2.1%).' },
      { t: '0:19', k: 'tool', text: 'risk.adverse_media(mch_BL_2904)' },
      { t: '0:22', k: 'finding', text: 'High-risk merchant. 2 acquirer terminations.' },
    ],
    findings: [
      { sev: 'high', text: 'Chargeback rate 4× industry p99' },
      { sev: 'high', text: '2 prior acquirer terminations' },
      { sev: 'med',  text: 'New entity (registered 2024-09)' },
    ],
    status: 'done',
  },
  network: {
    activity: 'Tracing receiving accounts · 2-hop graph',
    tool: { name: 'tidb.account_graph', q: 'BFS depth=2 FROM acq_A91F' },
    trace: [
      { t: '0:03', k: 'thought', text: 'Tracing acq_A91F (receiving acct).' },
      { t: '0:11', k: 'result', text: '47 nodes · 6 settlement accts · 3 mule signals.' },
      { t: '0:17', k: 'tool', text: 'cluster.match(graph_hash=0x4f81…)' },
    ],
    findings: [
      { sev: 'high', text: '0.91 match → cluster RING-142' },
      { sev: 'high', text: '18 prior victims in cluster' },
    ],
    status: 'working',
  },
  policy: {
    activity: 'Matching facts against Reg E + internal policies',
    tool: { name: 'mem9.read', q: 'case=2461 since=now-30s' },
    trace: [
      { t: '0:02', k: 'thought', text: 'Loading policy index.' },
      { t: '0:08', k: 'result', text: '4 facts in mem9: anomaly, hi-risk, ring, premium.' },
    ],
    findings: [],
    status: 'waiting',
  },
};

// Tool indicator chip — "now querying tidb.merchants"
function ToolChip({ tool, color, active }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 7px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text-2)',
    }}>
      {active && <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 5, background: color, display: 'inline-block' }} />}
      <span style={{ color: color, fontWeight: 600 }}>{tool.name}</span>
      <span style={{ color: 'var(--text-3)' }}>{tool.q}</span>
    </div>
  );
}

// Status pill — light-mode
function PodStatus({ status }) {
  const map = {
    working: { color: 'var(--sig-active)', label: 'WORKING', pulse: true },
    waiting: { color: 'var(--sig-warn)', label: 'WAITING', pulse: true },
    done:    { color: 'var(--sig-ok)', label: 'COMPLETE', pulse: false },
    idle:    { color: 'var(--sig-idle)', label: 'IDLE', pulse: false },
  };
  const s = map[status] || map.idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', borderRadius: 3,
      background: `color-mix(in oklab, ${s.color} 12%, white)`,
      color: s.color,
      fontFamily: 'var(--font-mono)',
      fontSize: 9, fontWeight: 600, letterSpacing: 0.7,
      lineHeight: 1.4,
    }}>
      <span className={s.pulse ? 'pulse-dot' : ''} style={{ width: 5, height: 5, borderRadius: 5, background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

// One agent panel
function AgentPanel({ agentKey, data, corner }) {
  const a = POD_AGENTS[agentKey];
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
      boxShadow: 'var(--shadow-1)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: a.tint,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: 'var(--bg-1)',
          color: a.color,
          border: `1px solid color-mix(in oklab, ${a.color} 30%, var(--border))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{a.glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.1, lineHeight: 1.2 }}>{a.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>agent.{a.id}</div>
        </div>
        <PodStatus status={data.status} />
      </div>

      {/* Activity sentence */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontSize: 11.5, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          {data.status === 'working' && <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 6, background: a.color, flexShrink: 0 }} />}
          {data.activity}
          {data.status === 'working' && <span className="stream-caret" style={{ color: a.color }} />}
        </div>
        <div style={{ marginTop: 6 }}>
          <ToolChip tool={data.tool} color={a.color} active={data.status === 'working' || data.status === 'waiting'} />
        </div>
      </div>

      {/* Trace stream */}
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 0', minHeight: 84 }}>
        {data.trace.map((tr, i) => (
          <PodTraceLine key={i} entry={tr} color={a.color} last={data.status === 'working' && i === data.trace.length - 1} />
        ))}
      </div>

      {/* Findings */}
      {data.findings.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px 12px', background: 'var(--bg-2)' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.8, fontFamily: 'var(--font-mono)', marginBottom: 5 }}>FINDINGS</div>
          {data.findings.map((f, i) => {
            const c = f.sev === 'high' ? 'var(--sig-danger)' : f.sev === 'med' ? 'var(--sig-warn)' : 'var(--text-3)';
            return (
              <div key={i} className="row-in" style={{ display: 'grid', gridTemplateColumns: '10px 1fr', gap: 8, padding: '3px 0', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: c, marginTop: 1 }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-1)', lineHeight: 1.4 }}>{f.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PodTraceLine({ entry, color, last }) {
  const k = {
    thought: { color: 'var(--text-2)', prefix: '·' },
    tool:    { color: color, prefix: '›', mono: true },
    result:  { color: 'var(--text-2)', prefix: '←', mono: true, dim: true },
    finding: { color: 'var(--sig-warn)', prefix: '!', strong: true },
  }[entry.k] || { color: 'var(--text-2)', prefix: '·' };
  return (
    <div className="row-in" style={{
      display: 'grid', gridTemplateColumns: '32px 12px 1fr',
      gap: 6, padding: '2px 12px',
      fontSize: 11, lineHeight: 1.5,
      borderLeft: entry.k === 'finding' ? `2px solid ${k.color}` : '2px solid transparent',
    }}>
      <span className="mono" style={{ color: 'var(--text-4)', fontSize: 10 }}>{entry.t}</span>
      <span style={{ color: k.color, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{k.prefix}</span>
      <span style={{
        color: k.color,
        fontFamily: k.mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontWeight: k.strong ? 600 : 400,
        opacity: k.dim ? 0.85 : 1,
      }}>
        {entry.text}
        {last && <span className="stream-caret" />}
      </span>
    </div>
  );
}

// mem9 hub — center circular element
function Mem9Hub({ size = 168, factCount = 7, recentFacts = [] }) {
  const r = size / 2;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--bg-1)',
      border: '1.5px solid var(--border)',
      boxShadow: '0 0 0 6px var(--bg-0), 0 8px 32px rgba(10, 31, 68, 0.10)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Concentric ring */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <circle cx={r} cy={r} r={r - 14} fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 1.2, textTransform: 'uppercase' }}>shared memory</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.5, marginTop: 2 }}>mem9</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>{factCount} facts</div>

      {/* Most-recent fact ticker */}
      {recentFacts[0] && (
        <div style={{ marginTop: 8, padding: '4px 8px', background: 'var(--bg-2)', borderRadius: 4, border: '1px solid var(--border-subtle)', maxWidth: size - 28 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.5 }}>
            JUST WRITTEN · {recentFacts[0].author}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-1)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {recentFacts[0].text}
          </div>
        </div>
      )}

      {/* Agent dots around the perimeter */}
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { k: 'customer', angle: -135 },
          { k: 'merchant', angle: -45 },
          { k: 'network',  angle:  135 },
          { k: 'policy',   angle:   45 },
        ].map(({ k, angle }) => {
          const rad = angle * Math.PI / 180;
          const x = r + (r - 8) * Math.cos(rad);
          const y = r + (r - 8) * Math.sin(rad);
          return (
            <circle key={k} cx={x} cy={y} r="4" fill={POD_AGENTS[k].color} />
          );
        })}
      </svg>
    </div>
  );
}

// Connection lines layer — SVG positioned absolute over the 2x2 grid
function PodConnections({ width, height, activity }) {
  // activity: { customer: 'write'|'read'|null, ... }
  const cx = width / 2, cy = height / 2;
  // corners — where each agent panel center sits, mapped to anchor points near the hub
  const anchors = {
    customer: { x: cx - 110, y: cy - 60, side: 'tl' },
    merchant: { x: cx + 110, y: cy - 60, side: 'tr' },
    network:  { x: cx - 110, y: cy + 60, side: 'bl' },
    policy:   { x: cx + 110, y: cy + 60, side: 'br' },
  };
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {Object.entries(anchors).map(([k, p]) => {
        const a = activity[k];
        if (!a) return null;
        const c = POD_AGENTS[k].color;
        const dir = a === 'write' ? 'agent-to-hub' : 'hub-to-agent';
        return (
          <g key={k}>
            <line x1={p.x} y1={p.y} x2={cx} y2={cy} stroke={c} strokeWidth="1.5" opacity="0.55"
              className="flow-line" style={{ animationDirection: dir === 'hub-to-agent' ? 'reverse' : 'normal' }} />
            {/* moving dot */}
            <circle r="3" fill={c}>
              <animateMotion dur="1.8s" repeatCount="indefinite"
                path={dir === 'agent-to-hub' ? `M${p.x},${p.y} L${cx},${cy}` : `M${cx},${cy} L${p.x},${p.y}`} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

// Investigation Pod — full center column
function InvestigationPod() {
  const recent = [
    { author: 'NETWORK', text: 'cluster_match = RING-142 (0.91)' },
    { author: 'MERCHANT', text: 'cb_rate_90d = 0.082' },
  ];

  // Right now: network is writing to mem9, policy is reading from mem9
  const activity = {
    customer: null,
    merchant: null,
    network: 'write',
    policy: 'read',
  };

  return (
    <div className="claims-root" style={{
      height: '100%', background: 'var(--bg-0)',
      padding: 16,
      display: 'flex', flexDirection: 'column',
      gap: 12,
      minHeight: 0,
    }}>
      {/* Pod header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>INVESTIGATION POD</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.3, marginTop: 2 }}>4 agents working in parallel</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--sig-active)' }} />
            <span className="mono" style={{ color: 'var(--text-2)' }}>0:24 elapsed</span>
          </div>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span className="mono" style={{ color: 'var(--text-3)' }}>SLA 2:00</span>
        </div>
      </div>

      {/* Grid + center hub */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 80,
          height: '100%',
          minHeight: 0,
        }}>
          <AgentPanel agentKey="customer" data={POD_TRACES.customer} />
          <AgentPanel agentKey="merchant" data={POD_TRACES.merchant} />
          <AgentPanel agentKey="network"  data={POD_TRACES.network}  />
          <AgentPanel agentKey="policy"   data={POD_TRACES.policy}   />
        </div>

        {/* Center hub overlay */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <Mem9Hub size={172} factCount={7} recentFacts={recent} />
        </div>

        {/* Connection lines drawn between the hub and any active agent */}
        <PodConnectionsAuto activity={activity} />
      </div>

      {/* Footer recap */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8 }}>STACK</span>
          <span className="mono">mem9 <b style={{ color: 'var(--text-1)' }}>4.2M</b></span>
          <span className="mono">drive9 <b style={{ color: 'var(--text-1)' }}>1.8M</b></span>
          <span className="mono">tidb <b style={{ color: 'var(--text-1)' }}>487M</b></span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(POD_AGENTS).map(([k, a]) => {
            const s = POD_TRACES[k].status;
            const dotColor = s === 'done' ? 'var(--sig-ok)' : s === 'working' ? 'var(--sig-active)' : s === 'waiting' ? 'var(--sig-warn)' : 'var(--text-4)';
            return (
              <div key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 7px', borderRadius: 4, background: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
                <span className={s === 'working' || s === 'waiting' ? 'pulse-dot' : ''} style={{ width: 5, height: 5, borderRadius: 5, background: dotColor }} />
                <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-2)', letterSpacing: 0.5 }}>{a.short}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Connections layer that measures its own parent
function PodConnectionsAuto({ activity }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    if (!ref.current || !ref.current.parentElement) return;
    const ro = new ResizeObserver(() => {
      const r = ref.current.parentElement.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(ref.current.parentElement);
    return () => ro.disconnect();
  }, []);
  const cx = size.w / 2, cy = size.h / 2;
  // Anchor points on the inner edge of each panel, near the hub
  const offset = 90; // distance from center
  const anchors = {
    customer: { x: cx - offset, y: cy - offset / 1.6 },
    merchant: { x: cx + offset, y: cy - offset / 1.6 },
    network:  { x: cx - offset, y: cy + offset / 1.6 },
    policy:   { x: cx + offset, y: cy + offset / 1.6 },
  };
  return (
    <svg ref={ref} width={size.w} height={size.h}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}>
      {/* Static idle wires */}
      {Object.entries(anchors).map(([k, p]) => (
        <line key={'idle-' + k} x1={p.x} y1={p.y} x2={cx} y2={cy} stroke="var(--border)" strokeWidth="1" opacity="0.7" />
      ))}
      {/* Active flows */}
      {Object.entries(anchors).map(([k, p]) => {
        const act = activity[k];
        if (!act) return null;
        const c = POD_AGENTS[k].color;
        const path = act === 'write' ? `M${p.x},${p.y} L${cx},${cy}` : `M${cx},${cy} L${p.x},${p.y}`;
        return (
          <g key={k}>
            <line x1={p.x} y1={p.y} x2={cx} y2={cy} stroke={c} strokeWidth="1.5" opacity="0.7"
              strokeDasharray="4 4" className="flow-line"
              style={{ animationDirection: act === 'read' ? 'reverse' : 'normal' }} />
            <circle r="3.5" fill={c}>
              <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { InvestigationPod, POD_AGENTS, POD_TRACES, AgentPanel, Mem9Hub, PodStatus, ToolChip });
