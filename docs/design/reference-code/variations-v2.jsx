// V2 variations — answering feedback round.

// ─── Hero B′ — 3-column: 2x2 agents (left), mem9 + drive9 stacked (right) ───
function HeroB2() {
  const lanes = [
    { key: 'customer', color: 'var(--c-customer)', pct: 100, status: 'done' },
    { key: 'merchant', color: 'var(--c-merchant)', pct: 100, status: 'done' },
    { key: 'network',  color: 'var(--c-network)',  pct: 88,  status: 'working' },
    { key: 'policy',   color: 'var(--c-policy)',   pct: 60,  status: 'waiting' },
  ];

  function QLane({ agent, status, traces, gridArea }) {
    return (
      <div style={{ gridArea, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <LaneHead agent={agent} status={status} />
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
          {traces.map((tr, i) => <TraceLine key={i} entry={tr} color={agent.color} last={status === 'working' && i === traces.length - 1} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-0)' }}>
      <CaseHeader />
      <ProgressStrip lanes={lanes} label="Investigation · 24s elapsed" />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 320px', minHeight: 0 }}>
        {/* Left two columns: 2x2 agents */}
        <div style={{
          gridColumn: '1 / span 2',
          display: 'grid',
          gridTemplate: '"a b" 1fr "c d" 1fr / 1fr 1fr',
          gap: 1, background: 'var(--border-subtle)',
          borderRight: '1px solid var(--border)',
          minHeight: 0,
        }}>
          <QLane agent={AGENTS.customer} status="done"    traces={TRACES.customer.slice(-4)} gridArea="a" />
          <QLane agent={AGENTS.merchant} status="done"    traces={TRACES.merchant.slice(-4)} gridArea="b" />
          <QLane agent={AGENTS.network}  status="working" traces={TRACES.network.slice(0, 5)}  gridArea="c" />
          <QLane agent={AGENTS.policy}   status="waiting" traces={TRACES.policy.slice(0, 4)}   gridArea="d" />
        </div>

        {/* Right column: mem9 (top) + drive9 (bottom) */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', minHeight: 0, background: 'var(--bg-1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderBottom: '1px solid var(--border)' }}>
            <SectionLabel count={MEM9.length} right={
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>shared memory</span>
            }>mem9</SectionLabel>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {MEM9.slice(0, 5).map(f => <Mem9Row key={f.id} fact={f} />)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SectionLabel count={4} right={
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>evidence pack</span>
            }>drive9</SectionLabel>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {DRIVE9.slice(0, 4).map((f, i) => <Drive9Row key={f.name} file={f} just={i === 3} />)}
            </div>
          </div>
        </div>
      </div>

      <DecisionBar armed={false} />
    </div>
  );
}

// ─── mem9 v2 — chronological feed with EXPLICIT cross-reads ───
// Each fact card shows the author chip + a stacked row of "read by" agent
// avatars, with a "ping" line connecting back to the agent's color band on
// the right edge. Newest fact has a live read-by counter ticking up.

function Mem9_FeedExplicit() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>mem9 — feed with explicit cross-reads</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>each fact shows author + every agent that read it; live ping when read</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'auto' }}>
        {MEM9.map((f, i) => (
          <Mem9Row key={f.id} fact={f} fresh={i === MEM9.length - 1} />
        ))}
      </div>
    </div>
  );
}

// Single mem9 row — author chip on left, fact in middle, "READ BY" agents on right
function Mem9Row({ fact, fresh }) {
  const author = AGENTS[fact.author];
  return (
    <div className={fresh ? 'row-in' : ''} style={{
      display: 'grid', gridTemplateColumns: '38px 1fr auto',
      gap: 10, padding: '9px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Author column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
        <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)' }}>{fact.t}</span>
        <span style={{
          width: 22, height: 22, borderRadius: 4,
          background: `color-mix(in oklab, ${author.color} 22%, transparent)`,
          color: author.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          border: `1px solid color-mix(in oklab, ${author.color} 40%, transparent)`,
        }} title={author.name + ' wrote'}>{author.glyph}</span>
      </div>

      {/* Fact text */}
      <div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: author.color, fontWeight: 700, letterSpacing: 0.5 }}>{author.short}</span>
          <span style={{ fontSize: 9, color: 'var(--text-4)' }}>wrote →</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.35 }}>{fact.text}</div>
      </div>

      {/* Read-by stack — explicit, labelled */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 84 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-4)', letterSpacing: 0.6, fontWeight: 600 }}>
          {fact.readBy.length > 0 ? `READ BY ${fact.readBy.length}` : 'UNREAD'}
        </span>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {fact.readBy.length === 0 && (
            <span style={{ fontSize: 9, color: 'var(--text-4)', fontStyle: 'italic' }}>—</span>
          )}
          {fact.readBy.map((r, i) => {
            const a = AGENTS[r];
            return (
              <span key={r} title={a.name + ' read this'} className={fresh && i === fact.readBy.length - 1 ? 'pulse-dot' : ''} style={{
                width: 18, height: 18, borderRadius: 4,
                background: `color-mix(in oklab, ${a.color} 18%, transparent)`,
                color: a.color,
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid color-mix(in oklab, ${a.color} 35%, transparent)`,
              }}>{a.glyph}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── drive9 v4 — author avatar + filetype icon (no color-coding by agent) ──

function getExt(name) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : 'file';
}

// File-type icon: a doc shape with the extension printed inside, monochrome.
function FileTypeIcon({ ext }) {
  const labelByExt = {
    md: 'MD',
    json: 'JSON',
    csv: 'CSV',
    pdf: 'PDF',
    txt: 'TXT',
  };
  const label = labelByExt[ext] || ext.toUpperCase().slice(0, 4);
  return (
    <div style={{
      width: 28, height: 34, position: 'relative',
      background: 'var(--bg-2)',
      border: '1px solid var(--border-strong)',
      borderRadius: 3,
      flexShrink: 0,
    }}>
      {/* dog-ear */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 8, height: 8,
        background: 'var(--bg-1)',
        borderLeft: '1px solid var(--border-strong)',
        borderBottom: '1px solid var(--border-strong)',
      }} />
      <div style={{
        position: 'absolute', bottom: 4, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 700,
        color: 'var(--text-2)', letterSpacing: 0.4,
      }}>{label}</div>
    </div>
  );
}

// Author avatar — initials pulled from agent name; agent color used in background tint only.
// Note per feedback: file itself stays neutral; agent identity = author chip only.
function AuthorChip({ author }) {
  if (author === 'system') {
    return (
      <span title="System" style={{
        width: 18, height: 18, borderRadius: 9,
        background: 'var(--bg-3)', color: 'var(--text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
        border: '1px solid var(--border-strong)',
      }}>·</span>
    );
  }
  const a = AGENTS[author];
  if (!a) return null;
  return (
    <span title={a.name} style={{
      width: 18, height: 18, borderRadius: 9,
      background: `color-mix(in oklab, ${a.color} 25%, transparent)`,
      color: a.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
      border: `1px solid color-mix(in oklab, ${a.color} 45%, transparent)`,
    }}>{a.glyph}</span>
  );
}

function Drive9Row({ file, just }) {
  const a = AGENTS[file.author];
  return (
    <div className={just ? 'row-in' : ''} style={{
      display: 'grid', gridTemplateColumns: '32px 1fr auto',
      gap: 10, padding: '9px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center',
    }}>
      <FileTypeIcon ext={getExt(file.name)} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AuthorChip author={file.author} />
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{a ? a.short : 'system'}</span>
          <span style={{ fontSize: 10, color: 'var(--text-4)' }}>· {file.size} · {file.t}</span>
        </div>
      </div>
      <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)' }}>{just ? 'JUST NOW' : ''}</span>
    </div>
  );
}

function Drive9_AuthorAvatar() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>drive9 — author avatars + filetype icons</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>file icon shows type (MD / JSON / CSV); author chip identifies the agent</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
        {DRIVE9.map((f, i) => <Drive9Row key={f.name} file={f} just={i === DRIVE9.length - 1} />)}
      </div>
    </div>
  );
}

// ─── Approval D — Inline as fifth drive9 file with Execute button ─────────
// Shows the FULL hero layout still on screen. The fifth file in drive9
// (recommended_action.md) lands as the natural conclusion of the agent
// workflow; clicking Execute marks each action as it fires. mem9 + agents
// stay visible the whole time. No separate approval screen.

function Approval_Inline() {
  const [phase, setPhase] = React.useState('ready'); // ready | executing | done

  const lanes = [
    { key: 'customer', color: 'var(--c-customer)', pct: 100, status: 'done' },
    { key: 'merchant', color: 'var(--c-merchant)', pct: 100, status: 'done' },
    { key: 'network',  color: 'var(--c-network)',  pct: 100, status: 'done' },
    { key: 'policy',   color: 'var(--c-policy)',   pct: 100, status: 'done' },
  ];

  // Sequential action execution
  const [actionStates, setActionStates] = React.useState([0, 0, 0, 0]); // 0 idle, 1 working, 2 done

  React.useEffect(() => {
    if (phase !== 'executing') return;
    let i = 0;
    const tick = () => {
      if (i >= 4) {
        setPhase('done');
        return;
      }
      setActionStates(s => { const n = [...s]; n[i] = 1; return n; });
      setTimeout(() => {
        setActionStates(s => { const n = [...s]; n[i] = 2; return n; });
        i += 1;
        setTimeout(tick, 300);
      }, 700);
    };
    tick();
  }, [phase]);

  const actions = [
    { t: 'Suspend card', d: '•••• 4421 · effective immediately' },
    { t: 'Issue provisional credit', d: '$4,280.00 → acct 8210' },
    { t: 'Open dispute case', d: 'Reg E §1005.11 · 10-day SLA' },
    { t: 'Write audit log + mem9', d: 'pattern → cluster_RING_142' },
  ];

  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-0)' }}>
      <CaseHeader />
      <ProgressStrip lanes={lanes} label="Investigation complete · 26s · awaiting commit" />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0 }}>
        {/* Left: shrunk pod evidence (still visible) */}
        <div style={{ display: 'grid', gridTemplate: '"a b" 1fr "c d" 1fr / 1fr 1fr', gap: 1, background: 'var(--border-subtle)', borderRight: '1px solid var(--border)', minHeight: 0 }}>
          {[
            { agent: AGENTS.customer, area: 'a', traces: TRACES.customer.slice(-2) },
            { agent: AGENTS.merchant, area: 'b', traces: TRACES.merchant.slice(-2) },
            { agent: AGENTS.network,  area: 'c', traces: TRACES.network.slice(-2) },
            { agent: AGENTS.policy,   area: 'd', traces: TRACES.policy.slice(-2) },
          ].map(({ agent, area, traces }) => (
            <div key={area} style={{ gridArea: area, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column' }}>
              <LaneHead agent={agent} status="done" />
              <div style={{ flex: 1, overflow: 'hidden', padding: '6px 0' }}>
                {traces.map((tr, i) => <TraceLine key={i} entry={tr} color={agent.color} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Right: drive9 with the recommended_action.md as fifth file (special) */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', minHeight: 0 }}>
          <SectionLabel count={5} right={
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>evidence pack</span>
          }>drive9</SectionLabel>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {DRIVE9.slice(0, 4).map(f => <Drive9Row key={f.name} file={f} />)}

            {/* The fifth file — the natural conclusion */}
            <div className="row-in" style={{
              padding: 12,
              borderTop: '1px solid var(--border)',
              background: phase === 'done'
                ? 'color-mix(in oklab, var(--sig-ok) 6%, transparent)'
                : 'color-mix(in oklab, var(--sig-active) 6%, transparent)',
              borderLeft: phase === 'done'
                ? '2px solid var(--sig-ok)'
                : '2px solid var(--sig-active)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <FileTypeIcon ext="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>recommended_action.md</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <AuthorChip author="system" />
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>synthesized · 0:26 · 1.2KB</span>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--sig-active)', letterSpacing: 0.6, fontWeight: 700 }}>
                  {phase === 'ready' && 'AWAITING ANALYST'}
                  {phase === 'executing' && 'EXECUTING…'}
                  {phase === 'done' && 'EXECUTED'}
                </span>
              </div>

              {/* The "file body" — synthesized recommendation rendered as markdown-ish */}
              <div style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                padding: 10,
                marginBottom: 10,
              }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}># Recommendation</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.5 }}>
                  AUTO-HOLD card · provisional credit $4,280.00 · open dispute under Reg E §1005.11.
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8, marginBottom: 4 }}>## Cited evidence</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { f: 'customer_pattern_anomaly.md', a: 'customer' },
                    { f: 'merchant_risk_report.md',     a: 'merchant' },
                    { f: 'network_graph.json',          a: 'network'  },
                    { f: 'policy_match.md',             a: 'policy'   },
                  ].map(c => (
                    <div key={c.f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AuthorChip author={c.a} />
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-2)' }}>{c.f}</span>
                    </div>
                  ))}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8, marginBottom: 4 }}>## Actions on execute</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {actions.map((a, i) => {
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
                          {st === 2 && <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="#06160d" strokeWidth="2.2"><path d="M1 4l2 2 4-4"/></svg>}
                        </span>
                        <div>
                          <div className="mono" style={{ fontSize: 11, color: st === 0 ? 'var(--text-2)' : 'var(--text-1)' }}>{a.t}</div>
                          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)', marginTop: 1 }}>{a.d}</div>
                        </div>
                        <span className="mono" style={{ fontSize: 9, color: c, letterSpacing: 0.5, fontWeight: 700 }}>
                          {st === 0 ? '' : st === 1 ? 'EXEC' : 'OK'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inline action — Execute lives ON the file, not in a modal */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {phase === 'ready' && (
                  <>
                    <button onClick={() => setPhase('executing')} style={{
                      flex: 1, padding: '8px 12px', border: 'none',
                      background: 'var(--sig-ok)', color: '#06160d',
                      fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
                      borderRadius: 5, cursor: 'pointer',
                    }}>Execute 4 actions →</button>
                    <button style={{
                      padding: '8px 10px', border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-2)', fontFamily: 'var(--font-sans)', fontSize: 11,
                      borderRadius: 5, cursor: 'pointer',
                    }}>Edit</button>
                    <button style={{
                      padding: '8px 10px', border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-2)', fontFamily: 'var(--font-sans)', fontSize: 11,
                      borderRadius: 5, cursor: 'pointer',
                    }}>Reject</button>
                  </>
                )}
                {phase === 'executing' && (
                  <span className="mono" style={{ fontSize: 11, color: 'var(--sig-active)', fontWeight: 600 }}>
                    Maya Singh approved · executing…<span className="stream-caret" />
                  </span>
                )}
                {phase === 'done' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--sig-ok)', fontWeight: 700, letterSpacing: 0.4 }}>
                      ✓ EXECUTED · DSP-9921 opened · pattern saved to mem9
                    </span>
                    <button onClick={() => { setPhase('ready'); setActionStates([0,0,0,0]); }} style={{
                      padding: '5px 10px', border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-3)', fontFamily: 'var(--font-sans)', fontSize: 10,
                      borderRadius: 4, cursor: 'pointer',
                    }}>Replay</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HeroB2, Mem9_FeedExplicit, Drive9_AuthorAvatar, Approval_Inline, Mem9Row, Drive9Row, FileTypeIcon, AuthorChip });
