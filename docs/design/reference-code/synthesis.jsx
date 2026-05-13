// Synthesis — a system-level conclusion block. Not attributed to an agent.
// Sits at the end of the conversation, folds in:
//   risk score + confidence
//   four-agent verdict pills
//   recommended-action narrative
//   cited evidence + actions on execute + buttons

function SynthesisMessage({ m }) {
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
        setTimeout(tick, 280);
      }, 620);
    };
    tick();
  }, [phase]);

  const scoreColor = m.score >= 80 ? 'var(--sig-danger)'
                   : m.score >= 50 ? 'var(--sig-warn)'
                   : 'var(--sig-ok)';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12,
      padding: '14px 0 12px',
      marginTop: 6,
      borderTop: '1px solid var(--border-subtle)',
    }}>
      {/* System glyph in place of avatar */}
      <div style={{
        width: 32, height: 32,
        borderRadius: 6,
        background: 'var(--bg-2)',
        border: '1px dashed var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-2)',
        fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
        letterSpacing: -0.5,
      }}>Σ</div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Synthesis</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            color: 'var(--text-2)', letterSpacing: 0.6,
            padding: '1px 6px', borderRadius: 3,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
          }}>SYSTEM</span>
          <span style={{
            fontSize: 11, color: 'var(--text-3)',
          }}>matched policy against mem9 facts</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 'auto' }}>{m.ts}</span>
        </div>

        <div style={{
          marginTop: 8,
          background: 'var(--bg-1)',
          border: '1.5px solid var(--border-strong)',
          borderLeft: phase === 'done'
            ? '4px solid var(--sig-ok)'
            : '4px solid color-mix(in oklab, var(--sig-danger) 70%, white)',
          borderRadius: 8,
          overflow: 'hidden',
          maxWidth: 620,
          boxShadow: 'var(--shadow-1)',
        }}>
          {/* Score + verdict strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '124px 1fr',
            background: 'color-mix(in oklab, var(--sig-danger) 4%, white)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              padding: '12px 14px',
              borderRight: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)',
                letterSpacing: 0.7, fontWeight: 600, marginBottom: 4,
              }}>RISK SCORE</div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 2,
                color: scoreColor,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, lineHeight: 1,
                  letterSpacing: -1,
                }}>{m.score}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>/100</span>
              </div>
              <div style={{
                marginTop: 8,
                width: 78, height: 3,
                borderRadius: 2,
                background: 'var(--bg-3)',
                overflow: 'hidden',
              }}>
                <div style={{ width: `${m.score}%`, height: '100%', background: scoreColor }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, color: 'var(--text-3)' }}>
                <b style={{ color: 'var(--text-1)', fontWeight: 600 }}>{(m.confidence * 100).toFixed(0)}%</b> confidence
              </div>
            </div>
            <div style={{
              padding: '12px 14px',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
            }}>
              {m.verdicts.map(v => <VerdictPill key={v.agent} v={v} />)}
            </div>
          </div>

          {/* Narrative + file */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)',
              letterSpacing: 0.7, fontWeight: 600, marginBottom: 6,
            }}>RECOMMENDED ACTION</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.55 }}>
              {m.narrative}
            </div>
            <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
              <SynthFile name={m.file} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                marginLeft: 'auto',
                color: phase === 'done' ? 'var(--sig-ok)' : 'var(--sig-warn)',
              }}>
                {phase === 'ready' && 'AWAITING REVIEW'}
                {phase === 'executing' && 'EXECUTING'}
                {phase === 'done' && '✓ RESOLVED'}
              </span>
            </div>
          </div>

          {/* Cited evidence + actions */}
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.7, fontWeight: 600, marginBottom: 6 }}>CITED EVIDENCE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {m.cited.map(c => {
                const a = CHAT_AGENTS[c.a];
                return (
                  <div key={c.f} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 7px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 4,
                  }}>
                    <span style={{
                      width: 12, height: 12, borderRadius: 6,
                      background: `color-mix(in oklab, ${a.color} 22%, white)`,
                      color: a.color, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{a.glyph}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-1)' }}>{c.f}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.7, fontWeight: 600, marginBottom: 6 }}>ACTIONS ON EXECUTE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {m.actions.map((a, i) => {
                const st = actionStates[i];
                const c = st === 2 ? 'var(--sig-ok)' : st === 1 ? 'var(--sig-active)' : 'var(--text-4)';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 8, alignItems: 'center' }}>
                    <span className={st === 1 ? 'pulse-dot' : ''} style={{
                      width: 12, height: 12, borderRadius: 12,
                      border: `1.5px solid ${c}`,
                      background: st === 2 ? c : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {st === 2 && <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="2.2"><path d="M1 4l2 2 4-4"/></svg>}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, color: st === 0 ? 'var(--text-2)' : 'var(--text-1)' }}>{a.t}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>{a.d}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 9.5, color: c, letterSpacing: 0.5, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>
                      {st === 0 ? '' : st === 1 ? 'EXEC' : 'OK'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              {phase === 'ready' && (
                <>
                  <button onClick={() => setPhase('executing')} style={{
                    padding: '8px 16px', border: 'none',
                    background: 'var(--text-1)', color: 'white',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                    borderRadius: 5, cursor: 'pointer',
                    boxShadow: 'var(--shadow-1)',
                  }}>Execute 4 actions →</button>
                  <button style={{
                    padding: '7px 11px', border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-2)', fontFamily: 'inherit', fontSize: 11.5,
                    borderRadius: 5, cursor: 'pointer',
                  }}>Edit</button>
                  <button style={{
                    padding: '7px 11px', border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-2)', fontFamily: 'inherit', fontSize: 11.5,
                    borderRadius: 5, cursor: 'pointer',
                  }}>Reject</button>
                </>
              )}
              {phase === 'executing' && (
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--sig-active)', fontWeight: 600 }}>
                  Maya Singh approved · executing…<span className="stream-caret" />
                </span>
              )}
              {phase === 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--sig-ok)', fontWeight: 700, letterSpacing: 0.4 }}>
                    ✓ RESOLVED · DSP-9921 opened · pattern saved to mem9
                  </span>
                  <button onClick={() => { setPhase('ready'); setActionStates(m.actions.map(() => 0)); }} style={{
                    padding: '4px 9px', border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-3)', fontFamily: 'inherit', fontSize: 10.5,
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

function VerdictPill({ v }) {
  const a = CHAT_AGENTS[v.agent];
  const toneColor = v.tone === 'danger' ? 'var(--sig-danger)'
                  : v.tone === 'warn'   ? 'var(--sig-warn)'
                  : 'var(--sig-ok)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 10.5, color: 'var(--text-3)',
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: 7,
          background: `color-mix(in oklab, ${a.color} 20%, white)`,
          color: a.color, fontFamily: 'var(--font-mono)',
          fontSize: 8.5, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{a.glyph}</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.label}</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '3px 7px',
        background: `color-mix(in oklab, ${toneColor} 10%, white)`,
        border: `1px solid color-mix(in oklab, ${toneColor} 25%, transparent)`,
        borderRadius: 4,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: toneColor, letterSpacing: 0.4,
        }}>{v.level}</span>
      </div>
    </div>
  );
}

function SynthFile({ name }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '5px 9px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 5,
    }}>
      <div style={{
        width: 18, height: 22, position: 'relative',
        background: 'var(--bg-1)',
        border: '1px solid var(--border-strong)',
        borderRadius: 2,
      }}>
        <div style={{
          position: 'absolute', bottom: 2, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 6.5, fontWeight: 700,
          color: 'var(--text-2)', letterSpacing: 0.3,
        }}>MD</div>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 500 }}>{name}</span>
      <span style={{ fontSize: 10, color: 'var(--text-4)' }}>· drive9</span>
    </div>
  );
}

Object.assign(window, { SynthesisMessage });
