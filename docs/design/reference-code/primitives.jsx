// CLAIMS primitives — small composable bits used across artboards.
// All assume .claims-root scope on a parent (for tokens/fonts).

const AGENTS = {
  customer: { id: 'customer', name: 'Customer History', short: 'CUST', color: 'var(--c-customer)', tint: 'var(--tint-customer)', glyph: 'C' },
  merchant: { id: 'merchant', name: 'Merchant Analysis', short: 'MERCH', color: 'var(--c-merchant)', tint: 'var(--tint-merchant)', glyph: 'M' },
  network:  { id: 'network',  name: 'Network Graph',    short: 'NET',   color: 'var(--c-network)',  tint: 'var(--tint-network)',  glyph: 'N' },
  policy:   { id: 'policy',   name: 'Policy Lookup',    short: 'POL',   color: 'var(--c-policy)',   tint: 'var(--tint-policy),',  glyph: 'P' },
};

// Status pill — one of: idle, working, waiting, done, flagged
function StatusPill({ status, size = 'sm' }) {
  const map = {
    idle:    { color: 'var(--sig-idle)',   label: 'IDLE',    pulse: false },
    working: { color: 'var(--sig-active)', label: 'WORKING', pulse: true  },
    waiting: { color: 'var(--sig-warn)',   label: 'WAITING', pulse: true  },
    done:    { color: 'var(--sig-ok)',     label: 'DONE',    pulse: false },
    flagged: { color: 'var(--sig-danger)', label: 'FLAGGED', pulse: false },
  };
  const s = map[status] || map.idle;
  const pad = size === 'sm' ? '2px 6px' : '3px 8px';
  const fs = size === 'sm' ? 9 : 10;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, borderRadius: 3,
      background: `color-mix(in oklab, ${s.color} 14%, transparent)`,
      color: s.color, fontSize: fs, fontWeight: 600, letterSpacing: 0.6,
      fontFamily: 'var(--font-mono)',
      lineHeight: 1,
    }}>
      <span className={s.pulse ? 'pulse-dot' : ''} style={{
        width: 5, height: 5, borderRadius: 5, background: s.color,
      }} />
      {s.label}
    </span>
  );
}

// Severity dot for risk
function RiskDot({ level }) {
  const c = level === 'high' ? 'var(--sig-danger)' : level === 'med' ? 'var(--sig-warn)' : level === 'ok' ? 'var(--sig-ok)' : 'var(--text-3)';
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 7, background: c }} />;
}

// Mono badge for IDs / amounts
function Mono({ children, color, size = 11 }) {
  return (
    <span className="mono" style={{ fontSize: size, color: color || 'var(--text-2)', letterSpacing: 0 }}>{children}</span>
  );
}

// Lane header: agent name + status + spinning glyph
function LaneHead({ agent, status, t }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: `linear-gradient(180deg, ${agent.tint || 'transparent'} 0%, transparent 100%)`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 4,
        background: `color-mix(in oklab, ${agent.color} 18%, transparent)`,
        color: agent.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
      }}>{agent.glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.1, lineHeight: 1.2 }}>{agent.name}</div>
        {t != null && <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{t}</div>}
      </div>
      <StatusPill status={status} />
    </div>
  );
}

// Section header inside panels
function SectionLabel({ children, count, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 12px',
      fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
      letterSpacing: 0.8, textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span>{children}</span>
      {count != null && <span style={{ color: 'var(--text-4)' }}>· {count}</span>}
      <span style={{ flex: 1 }} />
      {right}
    </div>
  );
}

// Top app bar — case header
function CaseHeader({ compact = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 12 : 18,
      padding: compact ? '8px 14px' : '10px 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          background: 'linear-gradient(135deg, var(--c-customer), var(--c-merchant))',
          opacity: 0.9,
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--text-1)' }}>CLAIMS</span>
      </div>
      <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
      <Mono size={11} color="var(--text-3)">CASE-2461</Mono>
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Sarah Chen</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Premium · since 2018</span>
        <span style={{ width: 1, height: 11, background: 'var(--border)' }} />
        <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--sig-danger)' }}>$4,280.00</span>
        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Bali, ID</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>03:14 PT</span>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
        padding: '3px 7px', borderRadius: 3,
        background: 'color-mix(in oklab, var(--sig-danger) 16%, transparent)',
        color: 'var(--sig-danger)', fontFamily: 'var(--font-mono)',
      }}>HIGH RISK</span>
    </div>
  );
}

// Overall progress strip — used at top, shows 4 lanes' fill %
function ProgressStrip({ lanes, label }) {
  // lanes: [{key, color, pct, status}]
  const total = lanes.reduce((s, l) => s + l.pct, 0) / lanes.length;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '8px 16px',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
        {label || 'Investigation'}
      </span>
      <div style={{ flex: 1, display: 'flex', gap: 3, height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-3)' }}>
        {lanes.map((l, i) => (
          <div key={l.key || i} style={{ flex: 1, position: 'relative', background: 'rgba(255,255,255,0.04)', borderRadius: 1 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${l.pct}%`, background: l.color, borderRadius: 1, transition: 'width .4s' }} />
          </div>
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 38, textAlign: 'right' }}>
        {Math.round(total)}%
      </span>
    </div>
  );
}

// Decision bar — bottom of hero screens
function DecisionBar({ armed = true, recommendation = 'AUTO-HOLD + PROVISIONAL CREDIT' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-1)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.8, fontFamily: 'var(--font-mono)' }}>RECOMMENDATION</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{recommendation}</div>
      </div>
      <button style={{
        padding: '8px 12px', border: '1px solid var(--border)', background: 'transparent',
        color: 'var(--text-2)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
        borderRadius: 6, cursor: 'pointer',
      }}>Escalate</button>
      <button style={{
        padding: '8px 12px', border: '1px solid var(--border)', background: 'transparent',
        color: 'var(--text-2)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
        borderRadius: 6, cursor: 'pointer',
      }}>Reject</button>
      <button disabled={!armed} style={{
        padding: '8px 14px', border: 'none',
        background: armed ? 'var(--sig-ok)' : 'var(--bg-3)',
        color: armed ? '#06160d' : 'var(--text-3)',
        fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
        borderRadius: 6, cursor: armed ? 'pointer' : 'not-allowed',
      }}>Approve →</button>
    </div>
  );
}

Object.assign(window, { AGENTS, StatusPill, RiskDot, Mono, LaneHead, SectionLabel, CaseHeader, ProgressStrip, DecisionBar });
