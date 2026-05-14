// "Under the Hood" right-side panel — TiDB / mem9 / drive9 telemetry.
// Light mode — aligned with the rest of the design system.
// Developer flavor stays via monospace type, terminal-style log lines, and
// crisp accent dots rather than chrome.

function UnderHoodPanel({ onCollapse, modeToggle }) {
  const [visibleCount, setVisibleCount] = React.useState(UNDER_HOOD.queries.length);
  React.useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= UNDER_HOOD.queries.length) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, []);

  return (
    <aside style={{
      width: 360, minWidth: 360,
      background: 'var(--bg-1)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Mode toggle row */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={onCollapse} title="Collapse"
          style={{
            width: 22, height: 22, padding: 0,
            background: 'transparent', border: 'none',
            borderRadius: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', marginLeft: -4, flexShrink: 0,
          }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 2L8 6L4 10" />
          </svg>
        </button>
        {modeToggle}
      </div>

      {/* Section header */}
      <div style={{
        padding: '12px 14px 6px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9.5,
            color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 700,
          }}>UNDER THE HOOD</div>
          <div style={{
            fontSize: 11, color: 'var(--text-3)', marginTop: 2,
          }}>
            How <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>TiDB</span>, <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>mem9</span>, and <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>drive9</span> power this case.
          </div>
        </div>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>live</span>
      </div>

      {/* Metrics strip */}
      <div style={{
        margin: '6px 12px 8px',
        padding: '10px 12px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
      }}>
        <Metric label="QPS"          value={UNDER_HOOD.metrics.qps.toLocaleString()} />
        <Metric label="P99"          value={UNDER_HOOD.metrics.p99} />
        <Metric label="VEC SEARCHES" value={UNDER_HOOD.metrics.vector} />
        <Metric label="HTAP"         value={UNDER_HOOD.metrics.htap} small />
      </div>

      {/* Body — scrolling sections */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Section title="TiDB · query log" badge={`${UNDER_HOOD.queries.length} queries`}>
          <div>
            {UNDER_HOOD.queries.slice(0, visibleCount).map((q, i) => (
              <QueryLine key={i} q={q} />
            ))}
            {visibleCount < UNDER_HOOD.queries.length && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px 8px', color: 'var(--text-3)', fontSize: 10 }}>
                <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--sig-active)' }} />
                <span className="mono">streaming…</span>
              </div>
            )}
          </div>
        </Section>

        <Section title="mem9 · facts" badge={`${UNDER_HOOD.mem9.read} read · ${UNDER_HOOD.mem9.queued} queued`}>
          <div>
            {UNDER_HOOD.mem9.facts.map((f, i) => (
              <FactLine key={i} f={f} />
            ))}
          </div>
        </Section>

        <Section title="drive9 · pinned" badge={`${UNDER_HOOD.drive9.pinned} files`} last>
          <div>
            {UNDER_HOOD.drive9.files.map((f, i) => (
              <FileLine key={i} f={f} />
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 10, color: 'var(--text-3)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-2)',
      }}>
        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--sig-ok)', flexShrink: 0 }} />
        <span className="mono">tidb-cloud · us-west-2a</span>
        <span className="mono" style={{ marginLeft: 'auto', color: 'var(--text-4)' }}>v8.5.1</span>
      </div>
    </aside>
  );
}

function Metric({ label, value, small }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8.5, letterSpacing: 0.7, color: 'var(--text-3)', fontWeight: 600,
      }}>{label}</div>
      <div className="mono" style={{
        fontSize: small ? 11 : 15, fontWeight: 600, color: 'var(--text-1)',
        marginTop: 2,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</div>
    </div>
  );
}

function Section({ title, badge, children, last }) {
  return (
    <div style={{
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      paddingBottom: 8,
    }}>
      <div style={{
        padding: '10px 14px 6px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9.5, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.7,
        }}>{title}</span>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{badge}</span>
      </div>
      {children}
    </div>
  );
}

// Query kind → color
const KIND_COLORS = {
  OLTP:  'var(--sig-active)',
  OLAP:  'var(--c-merchant)',
  VEC:   'var(--c-network)',
  GRAPH: 'var(--sig-danger)',
};

function QueryLine({ q }) {
  const a = CHAT_AGENTS[q.agent];
  return (
    <div className="row-in" style={{
      padding: '4px 14px',
      display: 'grid', gridTemplateColumns: '46px 38px 1fr auto',
      gap: 7, alignItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 10, lineHeight: 1.5,
    }}>
      <span style={{ color: 'var(--text-4)' }}>{q.ts.slice(-9, -4)}</span>
      <span style={{
        color: KIND_COLORS[q.kind] || 'var(--text-3)',
        fontWeight: 700, fontSize: 9, letterSpacing: 0.5,
      }}>{q.kind}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{
          width: 4, height: 4, borderRadius: 2, background: a.color, flexShrink: 0,
        }} />
        <span style={{
          color: 'var(--text-1)', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{q.table}</span>
        {q.note && (
          <span style={{ color: 'var(--text-3)', fontSize: 9.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            · {q.note}
          </span>
        )}
      </span>
      <span style={{ color: 'var(--text-3)', fontSize: 9.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {q.rows} · {q.latency}
      </span>
    </div>
  );
}

function FactLine({ f }) {
  const opColor = f.op === 'WRITE'  ? 'var(--sig-ok)'
                : f.op === 'QUEUED' ? 'var(--sig-warn)'
                : 'var(--sig-active)';
  const a = CHAT_AGENTS[f.agent];
  return (
    <div style={{
      padding: '5px 14px',
      display: 'grid', gridTemplateColumns: '52px 12px 1fr',
      gap: 7, alignItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 10, lineHeight: 1.5,
    }}>
      <span style={{ color: opColor, fontWeight: 700, fontSize: 9, letterSpacing: 0.5 }}>{f.op}</span>
      <span style={{ width: 4, height: 4, borderRadius: 2, background: a.color }} />
      <span style={{ color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.text}</span>
    </div>
  );
}

function FileLine({ f }) {
  const a = CHAT_AGENTS[f.agent];
  return (
    <div style={{
      padding: '4px 14px',
      display: 'grid', gridTemplateColumns: '12px 1fr auto',
      gap: 7, alignItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 10, lineHeight: 1.5,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: 2, background: a.color }} />
      <span style={{ color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
      <span style={{ color: 'var(--text-4)', fontSize: 9.5 }}>{f.size}</span>
    </div>
  );
}

Object.assign(window, { UnderHoodPanel });
