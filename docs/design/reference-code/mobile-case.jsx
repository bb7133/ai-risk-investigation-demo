// Mobile case detail — mirrors the desktop chat layout in a phone-width column.
// Same actors, same message types, same Synthesis at the end.

// ─── Top header (custom, sits under iOS status bar) ─────────────────────
function MobileHeader() {
  return (
    <div style={{
      padding: '54px 12px 10px',
      background: 'var(--bg-1)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Nav row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 30, height: 30, padding: 0,
          background: 'transparent', border: 'none',
          borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-1)',
          marginLeft: -4,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>#</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{CASE_META.id}</span>
        <span style={{
          marginLeft: 4,
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
          padding: '2px 6px', borderRadius: 3,
          background: 'color-mix(in oklab, var(--sig-danger) 12%, white)',
          color: 'var(--sig-danger)',
        }}>HIGH</span>
        <button style={{
          marginLeft: 'auto',
          width: 30, height: 30, padding: 0,
          background: 'transparent', border: 'none',
          borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="3" cy="7" r="1.1" fill="currentColor" />
            <circle cx="7" cy="7" r="1.1" fill="currentColor" />
            <circle cx="11" cy="7" r="1.1" fill="currentColor" />
          </svg>
        </button>
      </div>
      {/* Customer strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: 'color-mix(in oklab, var(--c-customer) 18%, white)',
          color: 'var(--c-customer)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 12,
          border: '1px solid color-mix(in oklab, var(--c-customer) 30%, transparent)',
          flexShrink: 0,
        }}>SC</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.15 }}>{CASE_META.customer.name}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 0, display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
            <span className="mono" style={{ color: 'var(--sig-danger)', fontWeight: 600 }}>{CASE_META.txn.amount}</span>
            <span>·</span>
            <span>{CASE_META.txn.merchant}</span>
            <span>·</span>
            <span>{CASE_META.txn.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar (mobile) ────────────────────────────────────────────────────
function MAvatar({ agent, user, size = 28 }) {
  const a = agent ? CHAT_AGENTS[agent] : null;
  const label = a ? a.glyph : (user ? user.short : '?');
  const color = a ? a.color : (user ? user.color : 'var(--text-3)');
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2,
      background: `color-mix(in oklab, ${color} 18%, white)`,
      color, fontFamily: 'var(--font-mono)',
      fontSize: Math.round(size * 0.42), fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
      flexShrink: 0,
    }}>{label}</span>
  );
}

// ─── System line ────────────────────────────────────────────────────────
function MSystemMessage({ m }) {
  return (
    <div style={{ padding: '4px 0 10px', textAlign: 'center' }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.3 }}>
        <span style={{ marginRight: 5, color: 'var(--text-4)' }}>{m.ts}</span>
        {m.text}
      </span>
    </div>
  );
}

// ─── User message (Maya) ────────────────────────────────────────────────
function MUserMessage({ m }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 9, padding: '4px 0 10px' }}>
      <MAvatar user={ANALYST} size={28} />
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{ANALYST.name}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700,
            color: ANALYST.color, letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: `color-mix(in oklab, ${ANALYST.color} 10%, white)`,
            border: `1px solid color-mix(in oklab, ${ANALYST.color} 22%, transparent)`,
          }}>YOU</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{m.ts}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.5, marginTop: 3 }}>
          {parseMentions(m.text)}
        </div>
      </div>
    </div>
  );
}

function parseMentions(text) {
  const parts = text.split(/(@\w+(?:\.\w+)?)/g);
  return parts.map((p, i) => {
    if (p.startsWith('@')) {
      const target = p.slice(1).split('.')[0];
      const a = CHAT_AGENTS[target] || (target === 'maya' ? null : null);
      if (a || target === 'maya') {
        const color = a ? a.color : ANALYST.color;
        return (
          <span key={i} style={{
            background: `color-mix(in oklab, ${color} 12%, white)`,
            color, padding: '0 4px', borderRadius: 3,
            fontWeight: 600, fontSize: 12,
          }}>{p}</span>
        );
      }
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// ─── Agent message group ────────────────────────────────────────────────
function MAgentMessage({ m }) {
  const a = CHAT_AGENTS[m.agent];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 9, padding: '6px 0 12px' }}>
      <MAvatar agent={m.agent} size={28} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{a.name}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700,
            color: a.color, letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: `color-mix(in oklab, ${a.color} 10%, white)`,
            border: `1px solid color-mix(in oklab, ${a.color} 20%, transparent)`,
          }}>AGENT</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{m.ts}</span>
        </div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {m.body.map((b, j) => <MBody key={j} b={b} agent={m.agent} />)}
        </div>
      </div>
    </div>
  );
}

function MBody({ b, agent }) {
  if (b.kind === 'narrative' || b.kind === 'p') {
    return (
      <div style={{ fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
        {b.mention && <span style={{
          background: `color-mix(in oklab, ${CHAT_AGENTS[b.mention]?.color || ANALYST.color} 12%, white)`,
          color: CHAT_AGENTS[b.mention]?.color || ANALYST.color,
          padding: '0 4px', borderRadius: 3, fontWeight: 600, marginRight: 3,
        }}>@{b.mention === 'maya' ? 'maya' : `${b.mention}.history`}</span>}
        {b.text.replace(/^@\w+(\.\w+)?\s*/, '')}
      </div>
    );
  }
  if (b.kind === 'viz') return <MViz viz={b.viz} agent={agent} />;
  if (b.kind === 'finding') {
    return (
      <div style={{
        padding: '6px 9px',
        background: 'color-mix(in oklab, var(--sig-warn) 8%, white)',
        border: '1px solid color-mix(in oklab, var(--sig-warn) 22%, transparent)',
        borderLeft: '3px solid var(--sig-warn)',
        borderRadius: 5,
        fontSize: 11.5, color: 'var(--text-1)', lineHeight: 1.45,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, color: 'var(--sig-warn)', textTransform: 'uppercase', marginRight: 6 }}>Finding</span>
        {b.text}
      </div>
    );
  }
  if (b.kind === 'inspect') return <MInspect items={b.items} agent={agent} />;
  return null;
}

// ─── Mobile inspect (collapsed by default) ──────────────────────────────
function MInspect({ items, agent }) {
  const [open, setOpen] = React.useState(false);
  const toolCount = items.filter(i => i.kind === 'tool').length;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'transparent', border: 'none', padding: '1px 0',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--text-2)', cursor: 'pointer', letterSpacing: 0.3,
      }}>
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.12s ease',
          color: 'var(--text-4)',
        }}>▸</span>
        Inspect query <span style={{ color: 'var(--text-4)' }}>· {toolCount} {toolCount === 1 ? 'query' : 'queries'}</span>
      </button>
      {open && (
        <div style={{
          marginTop: 5,
          padding: '6px 8px 8px',
          background: 'var(--bg-2)',
          border: '1px dashed var(--border)',
          borderRadius: 5,
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {items.map((it, i) => {
            if (it.kind === 'tool') {
              const a = CHAT_AGENTS[agent];
              return (
                <div key={i} className="mono" style={{
                  padding: '4px 7px', fontSize: 9.5,
                  background: 'var(--bg-1)', border: '1px solid var(--border-subtle)',
                  borderRadius: 4, lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  <span style={{ color: a.color, fontWeight: 600 }}>{it.name}</span>{' '}
                  <span style={{ color: 'var(--text-2)' }}>{it.q}</span>
                </div>
              );
            }
            if (it.kind === 'result') {
              return (
                <div key={i} className="mono" style={{
                  fontSize: 9.5, color: 'var(--text-2)', paddingLeft: 8,
                  borderLeft: '2px solid var(--border)', lineHeight: 1.5,
                }}>← {it.text}</div>
              );
            }
            if (it.kind === 'file') {
              return (
                <div key={i} className="mono" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 10, color: 'var(--text-1)',
                  padding: '3px 7px',
                  background: 'var(--bg-1)', border: '1px solid var(--border-subtle)',
                  borderRadius: 4, alignSelf: 'flex-start',
                }}>
                  <span style={{ color: 'var(--text-3)' }}>📄</span>
                  {it.name}
                  <span style={{ color: 'var(--text-4)' }}>· {it.size}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile viz — compact variants of the four signature visualizations ─
function MViz({ viz, agent }) {
  if (viz === 'customer-scatter') return <MVizScatter />;
  if (viz === 'merchant-gauge')   return <MVizGauge />;
  if (viz === 'network-graph')    return <MVizNetwork />;
  if (viz === 'policy-card')      return <MVizPolicy />;
  return null;
}

function VizCard({ caption, accent, children }) {
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 7,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '8px 10px 4px' }}>{children}</div>
      <div style={{
        padding: '6px 10px 7px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-2)',
        fontSize: 10.5, color: 'var(--text-2)',
        lineHeight: 1.4,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {accent && <span style={{ width: 5, height: 5, borderRadius: 3, background: accent, flexShrink: 0 }} />}
        <span>{caption}</span>
      </div>
    </div>
  );
}

function MVizScatter() {
  const W = 268, H = 130;
  const PADL = 30, PADR = 10, PADT = 10, PADB = 18;
  const innerW = W - PADL - PADR, innerH = H - PADT - PADB;
  const yMin = 20, yMax = 5000;
  const ly = (v) => Math.log10(Math.max(v, yMin));
  const yScale = (v) => PADT + innerH - ((ly(v) - ly(yMin)) / (ly(yMax) - ly(yMin))) * innerH;
  const xScale = (h) => PADL + (h / 24) * innerW;
  const outlier = VIZ_CUSTOMER.outlier;
  return (
    <VizCard caption={VIZ_CUSTOMER.caption} accent="var(--sig-danger)">
      <svg width={W} height={H} style={{ display: 'block' }}>
        {[50, 500, 5000].map((t, i) => (
          <g key={i}>
            <line x1={PADL} x2={W - PADR} y1={yScale(t)} y2={yScale(t)} stroke="var(--border-subtle)" />
            <text x={PADL - 4} y={yScale(t) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--text-3)">${t.toLocaleString()}</text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((t, i) => (
          <text key={i} x={xScale(t)} y={H - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--text-3)">{String(t).padStart(2, '0')}h</text>
        ))}
        <rect
          x={xScale(9)} width={xScale(22) - xScale(9)}
          y={yScale(220)} height={yScale(28) - yScale(220)}
          fill="color-mix(in oklab, var(--c-customer) 12%, transparent)"
          stroke="color-mix(in oklab, var(--c-customer) 35%, transparent)"
          strokeDasharray="2 2" rx="2"
        />
        {VIZ_CUSTOMER.baseline.map((p, i) => (
          <circle key={i} cx={xScale(p[0])} cy={yScale(p[1])} r="1.6" fill="var(--c-customer)" opacity="0.55" />
        ))}
        <circle cx={xScale(outlier.x)} cy={yScale(outlier.y)} r="8" fill="color-mix(in oklab, var(--sig-danger) 20%, transparent)" />
        <circle cx={xScale(outlier.x)} cy={yScale(outlier.y)} r="4" fill="var(--sig-danger)" stroke="white" strokeWidth="1.4" />
        <text x={xScale(outlier.x) + 10} y={yScale(outlier.y) - 2} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--sig-danger)" fontWeight="700">$4,280 · 6.4σ</text>
      </svg>
    </VizCard>
  );
}

function MVizGauge() {
  const W = 268, H = 96;
  const PADL = 10, PADR = 12, PADT = 14, PADB = 22;
  const innerW = W - PADL - PADR;
  const max = VIZ_MERCHANT.max;
  const xScale = (v) => PADL + (v / max) * innerW;
  const barY = PADT + 12, barH = 18;
  const merchantW = xScale(VIZ_MERCHANT.merchantRate) - PADL;
  return (
    <VizCard caption={VIZ_MERCHANT.caption} accent="var(--sig-danger)">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.5, fontWeight: 600 }}>90D CHARGEBACK</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)' }}>0–10%</span>
      </div>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <rect x={PADL} y={barY} width={innerW} height={barH} rx="2" fill="var(--bg-2)" stroke="var(--border-subtle)" />
        <rect
          x={xScale(VIZ_MERCHANT.industry.p50)} y={barY}
          width={xScale(VIZ_MERCHANT.industry.p99) - xScale(VIZ_MERCHANT.industry.p50)}
          height={barH}
          fill="color-mix(in oklab, var(--c-merchant) 14%, transparent)"
        />
        <rect x={PADL} y={barY} width={merchantW} height={barH} rx="2" fill="color-mix(in oklab, var(--sig-danger) 80%, white)" />
        <text x={PADL + merchantW - 6} y={barY + barH / 2 + 3.5} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700" fill="white">8.2%</text>
        {['p50','p90','p99'].map(k => {
          const v = VIZ_MERCHANT.industry[k];
          const x = xScale(v);
          return (
            <g key={k}>
              <line x1={x} x2={x} y1={barY - 3} y2={barY + barH + 3} stroke="var(--c-merchant)" />
              <text x={x} y={barY + barH + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--text-3)">{k} {v}%</text>
            </g>
          );
        })}
      </svg>
    </VizCard>
  );
}

function MVizNetwork() {
  const W = 268, H = 158;
  const { nodes, edges } = VIZ_NETWORK;
  // scale layout (orig center 160,90, radius ~85) to fit mobile width
  const sx = (x) => (x - 75) * (W / 170);
  const sy = (y) => (y - 5) * (H / 170);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const nodeColor = (k) => k === 'receiver' ? 'var(--sig-danger)'
                        : k === 'victim'   ? 'var(--c-network)'
                        : k === 'mule'     ? 'var(--sig-warn)'
                        : k === 'settle'   ? 'var(--text-2)' : 'var(--text-3)';
  return (
    <VizCard caption={VIZ_NETWORK.caption} accent="var(--c-network)">
      <svg width={W} height={H} style={{ display: 'block' }}>
        <ellipse cx={W/2} cy={H/2} rx={W/2 - 12} ry={H/2 - 8}
          fill="color-mix(in oklab, var(--c-network) 5%, transparent)"
          stroke="color-mix(in oklab, var(--c-network) 22%, transparent)"
          strokeDasharray="3 3" />
        {edges.map((e, i) => {
          const A = nodeMap[e.a], B = nodeMap[e.b];
          if (!A || !B) return null;
          return <line key={i}
            x1={sx(A.x)} y1={sy(A.y)} x2={sx(B.x)} y2={sy(B.y)}
            stroke={e.mule ? 'var(--sig-warn)' : 'var(--border-strong)'}
            strokeWidth={e.mule ? 1.1 : 0.55}
            strokeDasharray={e.mule ? '2 2' : undefined}
            opacity={e.mule ? 0.85 : 0.55}
          />;
        })}
        {nodes.map(n => (
          <g key={n.id}>
            {n.kind === 'receiver' && <circle cx={sx(n.x)} cy={sy(n.y)} r="12" fill="color-mix(in oklab, var(--sig-danger) 18%, transparent)" />}
            <circle cx={sx(n.x)} cy={sy(n.y)} r={n.r}
              fill={nodeColor(n.kind)}
              stroke={n.kind === 'receiver' ? 'white' : 'none'}
              strokeWidth={n.kind === 'receiver' ? 1.5 : 0} />
          </g>
        ))}
        <g transform="translate(8, 6)">
          <rect width="62" height="16" rx="3" fill="var(--bg-1)" stroke="var(--border)" />
          <text x="31" y="11" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" fill="var(--c-network)">RING-142</text>
        </g>
        <g transform={`translate(${W - 64}, 6)`}>
          <rect width="56" height="16" rx="3" fill="var(--bg-1)" stroke="var(--border)" />
          <text x="28" y="11" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fontWeight="700" fill="var(--text-1)">conf 0.91</text>
        </g>
      </svg>
    </VizCard>
  );
}

function MVizPolicy() {
  return (
    <VizCard caption={VIZ_POLICY.caption} accent="var(--c-policy)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {VIZ_POLICY.rows.map((row, i) => (
          <div key={i} style={{
            padding: '7px 9px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--c-policy)',
            borderRadius: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--c-policy)', letterSpacing: 0.3 }}>{row.code}</span>
              <span style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 600 }}>{row.title}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--sig-ok)', fontWeight: 700, letterSpacing: 0.6 }}>✓ MATCH</span>
            </div>
            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--text-1)', lineHeight: 1.4 }}>
              {row.eligibility[0]}{row.eligibility[1] ? ` · ${row.eligibility[1]}` : ''}
            </div>
          </div>
        ))}
      </div>
    </VizCard>
  );
}

// ─── Synthesis (mobile) ─────────────────────────────────────────────────
function MSynthesis({ m }) {
  const [phase, setPhase] = React.useState('ready');
  const [actionStates, setActionStates] = React.useState(m.actions.map(() => 0));

  React.useEffect(() => {
    if (phase !== 'executing') return;
    let i = 0;
    const tick = () => {
      if (i >= m.actions.length) { setPhase('done'); return; }
      setActionStates(s => { const n = [...s]; n[i] = 1; return n; });
      setTimeout(() => {
        setActionStates(s => { const n = [...s]; n[i] = 2; return n; });
        i += 1;
        setTimeout(tick, 220);
      }, 480);
    };
    tick();
  }, [phase]);

  const scoreColor = m.score >= 80 ? 'var(--sig-danger)' : m.score >= 50 ? 'var(--sig-warn)' : 'var(--sig-ok)';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr', gap: 9,
      padding: '12px 0 8px',
      marginTop: 4,
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'var(--bg-2)',
        border: '1px dashed var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
      }}>Σ</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>Synthesis</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700,
            color: 'var(--text-2)', letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
          }}>SYSTEM</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', marginLeft: 'auto' }}>{m.ts}</span>
        </div>
        <div style={{
          marginTop: 6,
          background: 'var(--bg-1)',
          border: '1.5px solid var(--border-strong)',
          borderLeft: phase === 'done' ? '3px solid var(--sig-ok)' : '3px solid color-mix(in oklab, var(--sig-danger) 70%, white)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-1)',
        }}>
          {/* Score + verdicts strip */}
          <div style={{
            padding: '10px 11px',
            background: 'color-mix(in oklab, var(--sig-danger) 4%, white)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 1, color: scoreColor,
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>{m.score}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>/100</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.6, fontWeight: 600 }}>RISK SCORE</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>
                <b style={{ color: 'var(--text-1)', fontWeight: 600 }}>{(m.confidence * 100).toFixed(0)}%</b> confidence
              </div>
            </div>
          </div>
          <div style={{
            padding: '10px 11px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {m.verdicts.map(v => <MobileVerdictPill key={v.agent} v={v} />)}
          </div>

          <div style={{ padding: '10px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.6, fontWeight: 600, marginBottom: 4 }}>RECOMMENDED ACTION</div>
            <div style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.5 }}>{m.narrative}</div>
          </div>

          <div style={{ padding: '10px 11px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--text-3)', letterSpacing: 0.6, fontWeight: 600, marginBottom: 5 }}>ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {m.actions.map((a, i) => {
                const st = actionStates[i];
                const c = st === 2 ? 'var(--sig-ok)' : st === 1 ? 'var(--sig-active)' : 'var(--text-4)';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 7, alignItems: 'center' }}>
                    <span className={st === 1 ? 'pulse-dot' : ''} style={{
                      width: 10, height: 10, borderRadius: 10,
                      border: `1.4px solid ${c}`,
                      background: st === 2 ? c : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {st === 2 && <svg width="6" height="6" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.2"><path d="M1 4l2 2 4-4"/></svg>}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: st === 0 ? 'var(--text-2)' : 'var(--text-1)', lineHeight: 1.35 }}>{a.t}</div>
                      <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{a.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12 }}>
              {phase === 'ready' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPhase('executing')} style={{
                    flex: 1, padding: '10px 12px',
                    background: 'var(--text-1)', color: 'white',
                    border: 'none', borderRadius: 8,
                    fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', letterSpacing: -0.1,
                  }}>Execute 4 actions →</button>
                  <button style={{
                    padding: '10px 12px',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-2)', borderRadius: 8,
                    fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
                  }}>Edit</button>
                </div>
              )}
              {phase === 'executing' && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--sig-active)', fontWeight: 600 }}>
                  Maya approved · executing…<span className="stream-caret" />
                </span>
              )}
              {phase === 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--sig-ok)', fontWeight: 700, letterSpacing: 0.3 }}>
                    ✓ RESOLVED · DSP-9921 · mem9 saved
                  </span>
                  <button onClick={() => { setPhase('ready'); setActionStates(m.actions.map(() => 0)); }} style={{
                    marginLeft: 'auto',
                    padding: '4px 8px', border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-3)', fontFamily: 'inherit', fontSize: 10,
                    borderRadius: 4, cursor: 'pointer',
                  }}>Replay</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileVerdictPill({ v }) {
  const a = CHAT_AGENTS[v.agent];
  const tone = v.tone === 'danger' ? 'var(--sig-danger)' : v.tone === 'warn' ? 'var(--sig-warn)' : 'var(--sig-ok)';
  return (
    <div style={{
      padding: '4px 3px',
      background: `color-mix(in oklab, ${tone} 8%, white)`,
      border: `1px solid color-mix(in oklab, ${tone} 22%, transparent)`,
      borderRadius: 5,
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, marginBottom: 2 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 5,
          background: `color-mix(in oklab, ${a.color} 22%, white)`,
          color: a.color, fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{a.glyph}</span>
        <span style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{v.label}</span>
      </div>
      <div className="mono" style={{ fontSize: 9, color: tone, fontWeight: 700, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{v.level}</div>
    </div>
  );
}

// ─── Composer ───────────────────────────────────────────────────────────
function MComposer() {
  return (
    <div style={{
      padding: '8px 10px 32px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-1)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 10px',
        border: '1px solid var(--border)', borderRadius: 20,
        background: 'var(--bg-1)',
      }}>
        <span style={{
          fontSize: 11, color: 'var(--text-3)', flex: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>Message #CASE-2461…</span>
        <button style={{
          width: 28, height: 28, padding: 0,
          background: 'var(--text-1)', color: 'white', border: 'none',
          borderRadius: 14, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h7M7 3l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── App body ───────────────────────────────────────────────────────────
function MobileCaseApp() {
  const scrollRef = React.useRef(null);

  return (
    <IOSDevice width={402} height={874} dark={false}>
      <div className="claims-root" style={{
        position: 'absolute', inset: 0,
        background: 'var(--bg-0)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <MobileHeader />
        <div ref={scrollRef} style={{
          flex: 1, overflow: 'auto',
          padding: '12px 12px 8px',
        }}>
          {MESSAGES.map((m, i) => {
            if (m.type === 'system') return <MSystemMessage key={i} m={m} />;
            if (m.type === 'user') return <MUserMessage key={i} m={m} />;
            if (m.type === 'synthesis') return <MSynthesis key={i} m={m} />;
            return <MAgentMessage key={i} m={m} />;
          })}
        </div>
        <MComposer />
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { MobileCaseApp });
