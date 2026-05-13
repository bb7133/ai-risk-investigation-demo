// Signature visualizations for each agent. Restrained, palette-aware.

// ─── Shared chrome ──────────────────────────────────────────────────────
function VizFrame({ children, caption, width = 360, accent }) {
  return (
    <div style={{
      maxWidth: width,
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 7,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 12px 4px' }}>
        {children}
      </div>
      <div style={{
        padding: '7px 12px 8px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-2)',
        fontSize: 11,
        color: 'var(--text-2)',
        lineHeight: 1.4,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {accent && (
          <span style={{
            width: 6, height: 6, borderRadius: 3,
            background: accent, flexShrink: 0,
          }} />
        )}
        <span>{caption}</span>
      </div>
    </div>
  );
}

// ─── Customer scatter — local hour × amount, outlier highlight ──────────
function VizCustomerScatter() {
  const W = 340, H = 158;
  const PADL = 36, PADR = 14, PADT = 12, PADB = 22;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;

  // log y to fit $20..$5000
  const yMin = 20, yMax = 5000;
  const ly = (v) => Math.log10(Math.max(v, yMin));
  const yScale = (v) => PADT + innerH - ((ly(v) - ly(yMin)) / (ly(yMax) - ly(yMin))) * innerH;
  const xScale = (h) => PADL + (h / 24) * innerW;

  const yTicks = [50, 500, 5000];
  const xTicks = [0, 6, 12, 18, 24];

  const outlier = VIZ_CUSTOMER.outlier;

  return (
    <VizFrame caption={VIZ_CUSTOMER.caption} accent="var(--sig-danger)">
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* y grid */}
        {yTicks.map((t, i) => (
          <g key={'y' + i}>
            <line x1={PADL} x2={W - PADR} y1={yScale(t)} y2={yScale(t)} stroke="var(--border-subtle)" strokeWidth="1" />
            <text x={PADL - 6} y={yScale(t) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-3)">${t.toLocaleString()}</text>
          </g>
        ))}
        {/* x ticks */}
        {xTicks.map((t, i) => (
          <text key={'x' + i} x={xScale(t)} y={H - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-3)">
            {String(t).padStart(2, '0')}h
          </text>
        ))}
        {/* axis baseline */}
        <line x1={PADL} x2={W - PADR} y1={H - PADB} y2={H - PADB} stroke="var(--border)" strokeWidth="1" />
        {/* baseline cluster halo */}
        <rect
          x={xScale(9)} width={xScale(22) - xScale(9)}
          y={yScale(220)} height={yScale(28) - yScale(220)}
          fill="color-mix(in oklab, var(--c-customer) 12%, transparent)"
          stroke="color-mix(in oklab, var(--c-customer) 35%, transparent)"
          strokeDasharray="2 2"
          strokeWidth="1"
          rx="2"
        />
        <text x={xScale(15.5)} y={yScale(220) - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--c-customer)" fontWeight="600">
          baseline cluster
        </text>
        {/* baseline points */}
        {VIZ_CUSTOMER.baseline.map((p, i) => (
          <circle key={i} cx={xScale(p[0])} cy={yScale(p[1])} r="1.8"
            fill="var(--c-customer)" opacity="0.55" />
        ))}
        {/* outlier */}
        <line x1={xScale(outlier.x)} x2={xScale(outlier.x)} y1={yScale(outlier.y) + 4} y2={H - PADB} stroke="var(--sig-danger)" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <circle cx={xScale(outlier.x)} cy={yScale(outlier.y)} r="9" fill="color-mix(in oklab, var(--sig-danger) 20%, transparent)" />
        <circle cx={xScale(outlier.x)} cy={yScale(outlier.y)} r="4.5" fill="var(--sig-danger)" stroke="white" strokeWidth="1.5" />
        <text x={xScale(outlier.x) + 12} y={yScale(outlier.y) - 2} fontFamily="var(--font-mono)" fontSize="9" fill="var(--sig-danger)" fontWeight="700">
          $4,280 · 03:14
        </text>
        <text x={xScale(outlier.x) + 12} y={yScale(outlier.y) + 9} fontFamily="var(--font-mono)" fontSize="8" fill="var(--sig-danger)" letterSpacing="0.5">
          6.4σ OUTLIER
        </text>
      </svg>
    </VizFrame>
  );
}

// ─── Merchant gauge — log-style scale, p50/p90/p99 refs, merchant bar ───
function VizMerchantGauge() {
  const W = 340, H = 124;
  const PADL = 12, PADR = 16, PADT = 18, PADB = 30;
  const innerW = W - PADL - PADR;
  const max = VIZ_MERCHANT.max;
  const xScale = (v) => PADL + (v / max) * innerW;
  const barY = PADT + 18;
  const barH = 22;
  const merchantW = xScale(VIZ_MERCHANT.merchantRate) - PADL;

  const ticks = [0, 2, 4, 6, 8, 10];

  return (
    <VizFrame caption={VIZ_MERCHANT.caption} accent="var(--sig-danger)">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 2,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.5, fontWeight: 600 }}>90D CHARGEBACK RATE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)' }}>0–10%</span>
      </div>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* track */}
        <rect x={PADL} y={barY} width={innerW} height={barH} rx="2"
          fill="var(--bg-2)" stroke="var(--border-subtle)" strokeWidth="1" />
        {/* industry reference shaded zone p50→p99 */}
        <rect
          x={xScale(VIZ_MERCHANT.industry.p50)}
          y={barY}
          width={xScale(VIZ_MERCHANT.industry.p99) - xScale(VIZ_MERCHANT.industry.p50)}
          height={barH}
          fill="color-mix(in oklab, var(--c-merchant) 14%, transparent)"
        />
        {/* merchant bar */}
        <rect x={PADL} y={barY} width={merchantW} height={barH} rx="2"
          fill="color-mix(in oklab, var(--sig-danger) 80%, white)" />
        {/* merchant label */}
        <text x={PADL + merchantW - 8} y={barY + barH / 2 + 4} textAnchor="end"
          fontFamily="var(--font-mono)" fontSize="11" fontWeight="700" fill="white">
          8.2%
        </text>
        {/* reference markers */}
        {['p50','p90','p99'].map((k) => {
          const v = VIZ_MERCHANT.industry[k];
          const x = xScale(v);
          return (
            <g key={k}>
              <line x1={x} x2={x} y1={barY - 4} y2={barY + barH + 4} stroke="var(--c-merchant)" strokeWidth="1" />
              <text x={x} y={barY - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--c-merchant)" fontWeight="700">{k.toUpperCase()}</text>
              <text x={x} y={barY + barH + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--text-3)">{v}%</text>
            </g>
          );
        })}
        {/* baseline ticks */}
        {ticks.map((t, i) => (
          <text key={i} x={xScale(t)} y={H - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-4)">{t}%</text>
        ))}
      </svg>
    </VizFrame>
  );
}

// ─── Network mini-graph — RING-142 cluster preview ──────────────────────
function VizNetworkGraph() {
  const W = 340, H = 200;
  const { nodes, edges } = VIZ_NETWORK;
  // map original (160,90) center coords to viz space (170,100)
  const cx = (x) => x + 10;
  const cy = (y) => y + 10;

  const nodeColor = (k) => {
    if (k === 'receiver') return 'var(--sig-danger)';
    if (k === 'victim')   return 'var(--c-network)';
    if (k === 'mule')     return 'var(--sig-warn)';
    if (k === 'settle')   return 'var(--text-2)';
    return 'var(--text-3)';
  };
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <VizFrame caption={VIZ_NETWORK.caption} accent="var(--c-network)">
      <div style={{ position: 'relative' }}>
        <svg width={W} height={H} style={{ display: 'block' }}>
          {/* cluster halo */}
          <ellipse cx={170} cy={100} rx="138" ry="88"
            fill="color-mix(in oklab, var(--c-network) 5%, transparent)"
            stroke="color-mix(in oklab, var(--c-network) 22%, transparent)"
            strokeDasharray="3 3" strokeWidth="1" />
          {/* edges */}
          {edges.map((e, i) => {
            const A = nodeMap[e.a], B = nodeMap[e.b];
            if (!A || !B) return null;
            return (
              <line key={i}
                x1={cx(A.x)} y1={cy(A.y)} x2={cx(B.x)} y2={cy(B.y)}
                stroke={e.mule ? 'var(--sig-warn)' : 'var(--border-strong)'}
                strokeWidth={e.mule ? 1.2 : 0.6}
                strokeDasharray={e.mule ? '2 2' : undefined}
                opacity={e.mule ? 0.85 : 0.55}
              />
            );
          })}
          {/* nodes */}
          {nodes.map((n) => (
            <g key={n.id}>
              {n.kind === 'receiver' && (
                <circle cx={cx(n.x)} cy={cy(n.y)} r="14"
                  fill="color-mix(in oklab, var(--sig-danger) 18%, transparent)" />
              )}
              <circle cx={cx(n.x)} cy={cy(n.y)} r={n.r}
                fill={nodeColor(n.kind)}
                stroke={n.kind === 'receiver' ? 'white' : 'none'}
                strokeWidth={n.kind === 'receiver' ? 1.5 : 0} />
            </g>
          ))}
          {/* receiver label */}
          <line x1={cx(160)} y1={cy(90) - 16} x2={cx(160)} y2={cy(90) - 32} stroke="var(--sig-danger)" strokeWidth="1" />
          <rect x={130} y={cy(90) - 50} width="80" height="16" rx="3"
            fill="var(--sig-danger)" />
          <text x={170} y={cy(90) - 39} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9" fill="white" fontWeight="700" letterSpacing="0.5">
            acq_A91F
          </text>
          {/* RING badge */}
          <g transform="translate(12, 12)">
            <rect width="68" height="18" rx="3" fill="var(--bg-1)" stroke="var(--border)" />
            <text x="34" y="12" textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="10" fontWeight="700" fill="var(--c-network)" letterSpacing="0.5">
              RING-142
            </text>
          </g>
          {/* confidence */}
          <g transform={`translate(${W - 78}, 12)`}>
            <rect width="66" height="18" rx="3" fill="var(--bg-1)" stroke="var(--border)" />
            <text x="33" y="12" textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="10" fontWeight="700" fill="var(--text-1)">
              conf 0.91
            </text>
          </g>
        </svg>
        {/* legend */}
        <div style={{
          position: 'absolute', bottom: 6, left: 10, right: 10,
          display: 'flex', gap: 12, flexWrap: 'wrap',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.3,
        }}>
          <LegendDot color="var(--sig-danger)" label="receiver" />
          <LegendDot color="var(--c-network)" label="prior victim · 18" />
          <LegendDot color="var(--sig-warn)" label="mule edge" dashed />
          <LegendDot color="var(--text-2)" label="settlement" />
        </div>
      </div>
    </VizFrame>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {dashed ? (
        <span style={{ width: 12, height: 1, borderTop: `1.5px dashed ${color}` }} />
      ) : (
        <span style={{ width: 7, height: 7, borderRadius: 4, background: color }} />
      )}
      <span>{label}</span>
    </span>
  );
}

// ─── Policy decision table ──────────────────────────────────────────────
function VizPolicyCard() {
  return (
    <VizFrame caption={VIZ_POLICY.caption} accent="var(--c-policy)" width={460}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {VIZ_POLICY.rows.map((row, i) => (
          <div key={i} style={{
            padding: '9px 11px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--c-policy)',
            borderRadius: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--c-policy)', letterSpacing: 0.4 }}>{row.code}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-1)', fontWeight: 600 }}>{row.title}</span>
              <span style={{ marginLeft: 'auto',
                fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--sig-ok)', fontWeight: 700, letterSpacing: 0.6,
                padding: '1px 6px', borderRadius: 3,
                background: 'color-mix(in oklab, var(--sig-ok) 12%, white)',
              }}>✓ MATCH</span>
            </div>
            <div style={{
              marginTop: 5,
              display: 'grid', gridTemplateColumns: '64px 1fr', gap: 6,
              fontSize: 11, color: 'var(--text-2)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.4 }}>TRIGGER</span>
              <span style={{ color: 'var(--text-1)' }}>{row.trigger}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.4 }}>GRANTS</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {row.eligibility.map((e, j) => (
                  <li key={j} style={{ color: 'var(--text-1)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--c-policy)', marginRight: 5 }}>→</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </VizFrame>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────
function AgentViz({ viz }) {
  if (viz === 'customer-scatter') return <VizCustomerScatter />;
  if (viz === 'merchant-gauge')   return <VizMerchantGauge />;
  if (viz === 'network-graph')    return <VizNetworkGraph />;
  if (viz === 'policy-card')      return <VizPolicyCard />;
  return null;
}

Object.assign(window, { AgentViz, VizCustomerScatter, VizMerchantGauge, VizNetworkGraph, VizPolicyCard });
