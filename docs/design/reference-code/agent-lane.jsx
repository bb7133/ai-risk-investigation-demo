// Agent lane content components — used inside artboards.

// Streaming trace line — one row of detective work
function TraceLine({ entry, color, last }) {
  const kindStyle = {
    thought: { color: 'var(--text-2)', prefix: '·' },
    tool:    { color: color || 'var(--sig-active)', prefix: '›', mono: true },
    result:  { color: 'var(--text-2)', prefix: '←', mono: true, dim: true },
    finding: { color: 'var(--sig-warn)', prefix: '!', strong: true },
  };
  const k = kindStyle[entry.kind] || kindStyle.thought;
  return (
    <div className="row-in" style={{
      display: 'grid', gridTemplateColumns: '32px 12px 1fr',
      gap: 6, padding: '3px 12px',
      fontSize: 11, lineHeight: 1.45,
      borderLeft: entry.kind === 'finding' ? `2px solid ${k.color}` : '2px solid transparent',
      background: entry.kind === 'finding' ? `color-mix(in oklab, ${k.color} 8%, transparent)` : 'transparent',
    }}>
      <span className="mono" style={{ color: 'var(--text-4)', fontSize: 10 }}>{entry.t}</span>
      <span style={{ color: k.color, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.3 }}>{k.prefix}</span>
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

// Full agent lane: header + scrolling trace
function AgentLane({ agent, status, traces, height = 320, streaming = true }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      overflow: 'hidden',
      minHeight: 0,
      height,
    }}>
      <LaneHead agent={agent} status={status} />
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {traces.map((tr, i) => (
          <TraceLine key={i} entry={tr} color={agent.color}
            last={streaming && i === traces.length - 1 && status === 'working'} />
        ))}
      </div>
    </div>
  );
}

// Compact lane (used in 2x2 / horizontal layouts)
function AgentLaneCompact({ agent, status, traces, lastTrace }) {
  const tr = lastTrace || traces[traces.length - 1];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <LaneHead agent={agent} status={status} />
      <div style={{ padding: '8px 12px' }}>
        <TraceLine entry={tr} color={agent.color} last={status === 'working'} />
      </div>
    </div>
  );
}

// Mini agent card — for queue / additional screens
function AgentMini({ agent, status }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 7px', borderRadius: 4,
      background: 'var(--bg-2)',
      border: '1px solid var(--border-subtle)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: agent.color }}
        className={status === 'working' ? 'pulse-dot' : ''} />
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
        {agent.short}
      </span>
    </div>
  );
}

// drive9 file row
function DriveFile({ file, just }) {
  const a = AGENTS[file.author];
  const dotColor = a ? a.color : 'var(--text-3)';
  return (
    <div className={just ? 'row-in' : ''} style={{
      display: 'grid',
      gridTemplateColumns: '14px 1fr auto',
      gap: 8, alignItems: 'center',
      padding: '7px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: just ? 'color-mix(in oklab, var(--sig-active) 6%, transparent)' : 'transparent',
    }}>
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke={dotColor} strokeWidth="1.2">
        <path d="M2 1h5l3 3v9H2z" />
        <path d="M7 1v3h3" />
      </svg>
      <div style={{ minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        {file.preview && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.preview}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{file.size}</div>
        <div className="mono" style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 1 }}>{file.t}</div>
      </div>
    </div>
  );
}

// mem9 fact chip
function MemChip({ fact, highlightTo }) {
  const a = AGENTS[fact.author];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 8px',
      background: 'var(--bg-2)',
      border: `1px solid color-mix(in oklab, ${a.color} 25%, var(--border))`,
      borderLeft: `2px solid ${a.color}`,
      borderRadius: 4,
      fontSize: 10,
    }}>
      <span className="mono" style={{ color: a.color, fontWeight: 600, letterSpacing: 0.4 }}>{a.short}</span>
      <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>{fact.text}</span>
      {fact.readBy && fact.readBy.length > 0 && (
        <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
          {fact.readBy.map(r => (
            <span key={r} title={`read by ${r}`}
              style={{ width: 5, height: 5, borderRadius: 5, background: AGENTS[r].color, opacity: 0.9 }} />
          ))}
        </span>
      )}
    </div>
  );
}

Object.assign(window, { TraceLine, AgentLane, AgentLaneCompact, AgentMini, DriveFile, MemChip });
