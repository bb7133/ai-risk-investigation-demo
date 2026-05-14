// Collapsible "Inspect query" block — wraps the SQL/tool call, raw result,
// and file attachment. Closed by default in persona mode.

function InspectQuery({ items, agent, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const a = CHAT_AGENTS[agent];

  // Sync open state when defaultOpen changes (e.g. switching modes).
  React.useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);

  return (
    <div style={{ marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'transparent', border: 'none', padding: '2px 0',
        fontFamily: 'var(--font-mono)', fontSize: 10.5,
        color: 'var(--text-3)', cursor: 'pointer',
        letterSpacing: 0.3,
      }}>
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.12s ease',
          color: 'var(--text-4)',
        }}>▸</span>
        <span style={{ color: 'var(--text-2)' }}>Inspect query</span>
        <span style={{ color: 'var(--text-4)' }}>· {countLabel(items)}</span>
      </button>
      {open && (
        <div style={{
          marginTop: 6,
          padding: '8px 10px 10px',
          background: 'var(--bg-2)',
          border: '1px dashed var(--border)',
          borderRadius: 5,
          maxWidth: 520,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8.5,
            color: 'var(--text-3)', letterSpacing: 0.7, fontWeight: 600,
            marginBottom: 6,
          }}>
            HOW THIS WAS COMPUTED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((it, i) => <InspectItem key={i} it={it} agent={agent} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function countLabel(items) {
  const toolCount = items.filter(i => i.kind === 'tool').length;
  const fileCount = items.filter(i => i.kind === 'file').length;
  const parts = [];
  if (toolCount) parts.push(`${toolCount} ${toolCount === 1 ? 'query' : 'queries'}`);
  if (fileCount) parts.push(`${fileCount} ${fileCount === 1 ? 'file' : 'files'}`);
  return parts.join(' · ');
}

function InspectItem({ it, agent }) {
  const a = CHAT_AGENTS[agent];
  if (it.kind === 'tool') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '5px 9px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={a.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h8M6 2l4 4-4 4" />
        </svg>
        <span className="mono" style={{ fontSize: 10.5, color: a.color, fontWeight: 600 }}>{it.name}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)' }}>{it.q}</span>
      </div>
    );
  }
  if (it.kind === 'result') {
    return (
      <div className="mono" style={{
        fontSize: 10.5, color: 'var(--text-2)',
        padding: '2px 0 2px 10px',
        borderLeft: '2px solid var(--border)',
        lineHeight: 1.5,
      }}>← {it.text}</div>
    );
  }
  if (it.kind === 'file') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        padding: '5px 9px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        alignSelf: 'flex-start',
      }}>
        <span style={{
          width: 18, height: 22, position: 'relative',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-strong)',
          borderRadius: 2,
          flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute', bottom: 2, left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 6.5, fontWeight: 700,
            color: 'var(--text-2)', letterSpacing: 0.3,
          }}>{(it.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'FILE').toUpperCase()}</span>
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-1)' }}>{it.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>· {it.size}</span>
        <span style={{ fontSize: 10, color: 'var(--text-4)' }}>· drive9</span>
      </div>
    );
  }
  return null;
}

Object.assign(window, { InspectQuery });
