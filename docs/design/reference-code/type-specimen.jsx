// Type comparison — same hero crop, swapped fonts.

function TypeSpecimen({ font, fontMono, name, tag }) {
  return (
    <div className="claims-root" style={{
      height: '100%', background: 'var(--bg-0)',
      ['--font-sans']: font,
      ['--font-mono']: fontMono,
      display: 'flex', flexDirection: 'column',
    }}>
      <CaseHeader compact />
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-1)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>TYPE DIRECTION</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.5, marginTop: 4 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{tag}</div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
        {/* Left — UI sample (status, lane head, decision) */}
        <div style={{ padding: 16, borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.8, fontFamily: 'var(--font-mono)' }}>UI SAMPLE</div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
            <LaneHead agent={AGENTS.network} status="working" t="0:24 · 47 nodes" />
            <div style={{ padding: '8px 0' }}>
              <TraceLine entry={TRACES.network[3]} color={AGENTS.network.color} />
              <TraceLine entry={TRACES.network[4]} color={AGENTS.network.color} />
              <TraceLine entry={TRACES.network[5]} color={AGENTS.network.color} last />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StatusPill status="working" />
            <StatusPill status="done" />
            <StatusPill status="waiting" />
            <StatusPill status="flagged" />
          </div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 500 }}>$4,280.00 · Bali, ID</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>txn_9F2A...4B</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>2026-05-06 03:14:24 PT</div>
          </div>
        </div>

        {/* Right — type scale */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.8, fontFamily: 'var(--font-mono)' }}>SCALE</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.4, lineHeight: 1.1 }}>Sarah Chen</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Display · 24 / 600</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-1)' }}>High-risk transaction flagged</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Title · 16 / 500</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>4 specialist agents are investigating this transaction in parallel.</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Body · 12 / 400</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-1)' }}>0123456789 · O0Il1 · $4,280.00</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Mono · 12 · numerals</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: 1, fontWeight: 600 }}>CASE-2461 · HIGH RISK</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Caption · 10 mono / 600 / +1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeGeist() {
  return <TypeSpecimen
    name="Geist"
    tag="Modern, Linear-adjacent. Tight letter-spacing, geometric numerals."
    font="'Geist', system-ui, sans-serif"
    fontMono="'Geist Mono', ui-monospace, monospace"
  />;
}

function TypePlex() {
  return <TypeSpecimen
    name="IBM Plex"
    tag="Editorial fintech. Slightly warmer, more institutional."
    font="'IBM Plex Sans', system-ui, sans-serif"
    fontMono="'IBM Plex Mono', ui-monospace, monospace"
  />;
}

Object.assign(window, { TypeGeist, TypePlex });
