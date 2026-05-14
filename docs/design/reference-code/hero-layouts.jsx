// Hero A — Four vertical lanes (the canonical layout). mem9 spine below, drive9 right dock.

function HeroA() {
  const lanes = [
    { key: 'customer', color: 'var(--c-customer)', pct: 100, status: 'done' },
    { key: 'merchant', color: 'var(--c-merchant)', pct: 100, status: 'done' },
    { key: 'network',  color: 'var(--c-network)',  pct: 88,  status: 'working' },
    { key: 'policy',   color: 'var(--c-policy)',   pct: 60,  status: 'waiting' },
  ];

  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-0)' }}>
      <CaseHeader />
      <ProgressStrip lanes={lanes} label="Investigation · 24s elapsed · 2:00 SLA" />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 0 }}>
        {/* Left — 4 lanes + mem9 spine */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid var(--border-subtle)' }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border-subtle)', minHeight: 0 }}>
            <AgentLane agent={AGENTS.customer} status="done"    traces={TRACES.customer} height="auto" />
            <AgentLane agent={AGENTS.merchant} status="done"    traces={TRACES.merchant} height="auto" />
            <AgentLane agent={AGENTS.network}  status="working" traces={TRACES.network.slice(0, 6)} height="auto" />
            <AgentLane agent={AGENTS.policy}   status="waiting" traces={TRACES.policy.slice(0, 4)} height="auto" />
          </div>

          {/* mem9 spine */}
          <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
            <SectionLabel count={MEM9.length} right={
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>shared memory pool</span>
            }>mem9</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 12 }}>
              {MEM9.map(f => <MemChip key={f.id} fact={f} />)}
            </div>
          </div>
        </div>

        {/* Right — drive9 */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', minHeight: 0 }}>
          <SectionLabel count={4} right={
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>evidence pack</span>
          }>drive9</SectionLabel>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {DRIVE9.slice(0, 4).map((f, i) => <DriveFile key={f.name} file={f} just={i === 3} />)}
            <div style={{ padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 12, border: '1.5px dashed var(--text-3)' }} className="pulse-dot" />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>recommendation.md · pending</span>
            </div>
          </div>
        </div>
      </div>

      <DecisionBar armed={false} />
    </div>
  );
}

// Hero B — 2x2 quadrants. mem9 in center as a graph node. drive9 right rail.
function HeroB() {
  const lanes = [
    { key: 'customer', color: 'var(--c-customer)', pct: 100, status: 'done' },
    { key: 'merchant', color: 'var(--c-merchant)', pct: 100, status: 'done' },
    { key: 'network',  color: 'var(--c-network)',  pct: 88,  status: 'working' },
    { key: 'policy',   color: 'var(--c-policy)',   pct: 60,  status: 'waiting' },
  ];

  // Quadrant lane (compact trace + scrolling)
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

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 0 }}>
        <div style={{
          position: 'relative',
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

          {/* Center mem9 hub */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 130, height: 130, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--bg-2) 30%, var(--bg-1) 100%)',
            border: '1px solid var(--border-strong)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 6px var(--bg-0), 0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 2,
          }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', letterSpacing: 0.8 }}>mem9</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{MEM9.length} facts</span>
            <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
              {Object.values(AGENTS).map(a => (
                <span key={a.id} style={{ width: 6, height: 6, borderRadius: 6, background: a.color, opacity: 0.9 }} />
              ))}
            </div>
          </div>
        </div>

        {/* drive9 rail */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', minHeight: 0 }}>
          <SectionLabel count={4} right={
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>evidence pack</span>
          }>drive9</SectionLabel>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {DRIVE9.slice(0, 4).map((f, i) => <DriveFile key={f.name} file={f} just={i === 3} />)}
          </div>
        </div>
      </div>

      <DecisionBar armed={false} />
    </div>
  );
}

// Hero C — Single case file at top, agents as horizontal swimlanes underneath (timeline). drive9 inline.
function HeroC() {
  const lanes = [
    { key: 'customer', color: 'var(--c-customer)', pct: 100, status: 'done' },
    { key: 'merchant', color: 'var(--c-merchant)', pct: 100, status: 'done' },
    { key: 'network',  color: 'var(--c-network)',  pct: 88,  status: 'working' },
    { key: 'policy',   color: 'var(--c-policy)',   pct: 60,  status: 'waiting' },
  ];

  function Swimlane({ agent, status, traces, currentT }) {
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '160px 1fr',
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: 64,
      }}>
        {/* lane label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          borderRight: '1px solid var(--border-subtle)',
          background: `linear-gradient(90deg, ${agent.tint || 'transparent'} 0%, transparent 100%)`,
        }}>
          <span style={{ width: 4, height: 32, borderRadius: 2, background: agent.color }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>{agent.name}</div>
            <div style={{ marginTop: 3 }}><StatusPill status={status} /></div>
          </div>
        </div>
        {/* swimlane track — events placed by time */}
        <div style={{ position: 'relative', padding: '6px 12px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 12, right: 12, borderLeft: '1px dashed var(--border-subtle)', opacity: 0.4 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {traces.slice(-3).map((tr, i) => (
              <TraceLine key={i} entry={tr} color={agent.color}
                last={status === 'working' && i === Math.min(2, traces.length - 1)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="claims-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-0)' }}>
      <CaseHeader />
      <ProgressStrip lanes={lanes} label="Investigation timeline · 24s of 2:00" />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Customer contact */}
          <div style={{ padding: '10px 16px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>CUSTOMER STATEMENT</div>
            <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 4, fontStyle: 'italic' }}>
              "I did not make this transaction. I am in San Francisco."
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Swimlane agent={AGENTS.customer} status="done"    traces={TRACES.customer} />
            <Swimlane agent={AGENTS.merchant} status="done"    traces={TRACES.merchant} />
            <Swimlane agent={AGENTS.network}  status="working" traces={TRACES.network.slice(0, 6)} />
            <Swimlane agent={AGENTS.policy}   status="waiting" traces={TRACES.policy.slice(0, 4)} />
          </div>

          {/* mem9 strip */}
          <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
            <SectionLabel count={MEM9.length}>mem9 · shared memory</SectionLabel>
            <div style={{ display: 'flex', gap: 6, padding: '8px 12px', overflow: 'auto', whiteSpace: 'nowrap' }}>
              {MEM9.map(f => <MemChip key={f.id} fact={f} />)}
            </div>
          </div>
        </div>

        {/* drive9 */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', minHeight: 0 }}>
          <SectionLabel count={4}>drive9 · evidence</SectionLabel>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {DRIVE9.slice(0, 4).map((f, i) => <DriveFile key={f.name} file={f} just={i === 3} />)}
          </div>
        </div>
      </div>

      <DecisionBar armed={false} />
    </div>
  );
}

Object.assign(window, { HeroA, HeroB, HeroC });
