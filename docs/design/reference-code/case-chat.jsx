// Case chat — Slack/Discord-flavored UI for CLAiMS.
// Three panes: channels (left) · chat (center) · members + pinned (right).

// ─── Avatars ────────────────────────────────────────────────────────────
function Avatar({ agent, user, size = 32, onClick, status }) {
  const a = agent ? CHAT_AGENTS[agent] : null;
  const label = a ? a.glyph : (user ? user.short : '?');
  const color = a ? a.color : (user ? user.color : 'var(--text-3)');
  const clickable = !!onClick;
  return (
    <span onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={a ? a.name : (user ? user.name : '')}
      style={{
        width: size, height: size, borderRadius: size / 2,
        background: `color-mix(in oklab, ${color} 18%, white)`,
        color, fontFamily: 'var(--font-mono)',
        fontSize: Math.round(size * 0.42), fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
        cursor: clickable ? 'pointer' : 'default',
        padding: 0,
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}>
      {label}
      {status && (
        <span style={{
          position: 'absolute', bottom: -1, right: -1,
          width: Math.round(size * 0.28), height: Math.round(size * 0.28),
          borderRadius: '50%',
          background: status === 'working' ? 'var(--sig-active)'
                    : status === 'done' ? 'var(--sig-ok)'
                    : status === 'waiting' ? 'var(--sig-warn)'
                    : 'var(--text-4)',
          border: '2px solid var(--bg-1)',
        }} className={status === 'working' || status === 'waiting' ? 'pulse-dot' : ''} />
      )}
    </span>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────
function ModeToggle({ mode, onChange, compact }) {
  const OPTIONS = [
    { v: 'persona', label: 'Case',  hint: 'Maya · fraud ops view',     dot: 'var(--c-customer)' },
    { v: 'demo',    label: 'Stack', hint: 'TiDB · mem9 · drive9 view', dot: 'var(--c-network)'  },
  ];
  if (compact) {
    // Vertical/tight rail variant for the collapsed panel
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {OPTIONS.map(opt => {
          const active = mode === opt.v;
          return (
            <button key={opt.v} onClick={() => onChange(opt.v)} title={opt.hint}
              style={{
                width: 28, height: 28, padding: 0,
                background: active ? 'var(--bg-1)' : 'transparent',
                border: '1px solid ' + (active ? 'var(--border)' : 'var(--border-subtle)'),
                borderRadius: 5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                letterSpacing: 0.4,
              }}>
              {opt.label[0]}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'stretch',
      padding: 2, background: 'var(--bg-2)',
      border: '1px solid var(--border-subtle)', borderRadius: 6,
      gap: 0,
      width: '100%',
    }}>
      {OPTIONS.map(opt => {
        const active = mode === opt.v;
        return (
          <button key={opt.v} onClick={() => onChange(opt.v)} title={opt.hint} style={{
            flex: 1,
            padding: '5px 8px',
            border: 'none', cursor: 'pointer',
            background: active ? 'var(--bg-1)' : 'transparent',
            color: active ? 'var(--text-1)' : 'var(--text-3)',
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: active ? 600 : 500,
            borderRadius: 4,
            boxShadow: active ? 'var(--shadow-1)' : 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function AppHeader({ onNewCase }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center',
      padding: '8px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 244 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: 'linear-gradient(135deg, var(--c-customer), var(--c-merchant))',
        }} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, color: 'var(--text-1)' }}>CLAiMS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6, marginTop: -1 }}>fraud + dispute ops</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', maxWidth: 460, width: '50%',
          background: 'var(--bg-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 6,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.6">
            <circle cx="6" cy="6" r="4.5" /><path d="M9.5 9.5L12.5 12.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, color: 'var(--text-3)', flex: 1 }}>Search cases, customers, merchants…</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)', padding: '1px 5px', border: '1px solid var(--border-subtle)', borderRadius: 3 }}>⌘K</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onNewCase} style={{
          padding: '5px 10px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 5,
          color: 'var(--text-2)', fontSize: 11.5,
          fontFamily: 'inherit', cursor: 'pointer',
        }}>
          New case
        </button>
        <Avatar user={ANALYST} size={28} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-1)', fontWeight: 500 }}>{ANALYST.name}</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{ANALYST.role}</div>
        </div>
      </div>
    </header>
  );
}

// ─── Channels sidebar ───────────────────────────────────────────────────
const TODAY_HOURS = 8;
function parseWhenToHours(w) {
  const m1 = w.match(/^(\d+)m$/);
  if (m1) return parseInt(m1[1], 10) / 60;
  const m2 = w.match(/^(\d+)h\s*(?:(\d+)m)?$/);
  if (m2) return parseInt(m2[1], 10) + (m2[2] ? parseInt(m2[2], 10) / 60 : 0);
  return 999;
}

const SECTIONS = [
  {
    v: 'awaiting',
    label: 'Awaiting my review',
    sub:   'High priority',
    match: c => c.assignee === 'maya' && c.status === 'awaiting' && c.priority === 'high',
  },
  {
    v: 'investigating',
    label: 'Investigating',
    sub:   'In progress',
    match: c => c.assignee === 'maya' && c.status === 'investigating',
  },
  {
    v: 'resolved',
    label: 'Resolved by me',
    sub:   'Today',
    match: c => c.assignee === 'maya' && c.status === 'resolved' && parseWhenToHours(c.when) <= TODAY_HOURS,
  },
  {
    v: 'all',
    label: 'All cases',
    sub:   'Everything in the queue',
    match: () => true,
  },
];

function ChannelsSidebar({ activeId, onSelect }) {
  // Default to the section the active case belongs to (or 'awaiting').
  const initial = React.useMemo(() => {
    const active = CHANNELS.find(c => c.id === activeId);
    if (active) {
      const hit = SECTIONS.find(s => s.v !== 'all' && s.match(active));
      if (hit) return hit.v;
    }
    return 'awaiting';
  }, []);

  const [section, setSection] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const counts = React.useMemo(() => {
    const c = {};
    for (const s of SECTIONS) c[s.v] = CHANNELS.filter(s.match).length;
    return c;
  }, []);

  const unreads = React.useMemo(() => {
    const u = {};
    for (const s of SECTIONS) {
      u[s.v] = CHANNELS.filter(s.match).reduce((acc, c) => acc + (c.unread || 0), 0);
    }
    return u;
  }, []);

  const items = React.useMemo(() => {
    const s = SECTIONS.find(s => s.v === section);
    return s ? CHANNELS.filter(s.match) : CHANNELS;
  }, [section]);

  const activeSection = SECTIONS.find(s => s.v === section) || SECTIONS[0];
  const toneFor = (v) => v === 'awaiting' ? 'var(--sig-danger)'
                       : v === 'investigating' ? 'var(--sig-active)'
                       : v === 'resolved' ? 'var(--sig-ok)'
                       : 'var(--text-3)';

  return (
    <aside style={{
      width: 264, minWidth: 264,
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        padding: '12px 14px 6px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 700,
        }}>CASES</span>
      </div>

      {/* Dropdown trigger */}
      <div ref={ref} style={{ position: 'relative', padding: '0 10px 10px' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: '100%',
          display: 'grid', gridTemplateColumns: '1fr auto 14px', gap: 8,
          alignItems: 'center',
          padding: '8px 10px',
          background: open ? 'var(--bg-2)' : 'var(--bg-1)',
          border: '1px solid ' + (open ? 'var(--border-strong)' : 'var(--border)'),
          borderRadius: 6, cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit',
        }}>
          <span style={{ minWidth: 0 }}>
            <span style={{
              display: 'block',
              fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{activeSection.label}</span>
            <span style={{
              display: 'block',
              fontSize: 10.5, color: 'var(--text-3)',
              fontFamily: 'var(--font-mono)', letterSpacing: 0.2,
              marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{activeSection.sub}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span className="mono" title={`${counts[activeSection.v]} cases`} style={{
              minWidth: 22, padding: '1px 7px',
              borderRadius: 10,
              background: 'var(--bg-3)',
              color: 'var(--text-2)',
              fontSize: 10, fontWeight: 700,
              textAlign: 'center',
              lineHeight: '15px',
            }}>{counts[activeSection.v]}</span>
            {unreads[activeSection.v] > 0 && (
              <span className="mono" title={`${unreads[activeSection.v]} unread`} style={{
                minWidth: 22, padding: '1px 7px',
                borderRadius: 10,
                background: 'var(--sig-danger)',
                color: 'white',
                fontSize: 10, fontWeight: 700,
                textAlign: 'center',
                lineHeight: '15px',
              }}>{unreads[activeSection.v]}</span>
            )}
          </span>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.12s ease',
          }}>
            <path d="M3 4.5L6 7.5L9 4.5" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 10, right: 10,
            marginTop: 4, zIndex: 20,
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            boxShadow: 'var(--shadow-2)',
            padding: 4,
          }}>
            {SECTIONS.map((s, i) => (
              <React.Fragment key={s.v}>
                {s.v === 'all' && (
                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 6px' }} />
                )}
                <button onClick={() => { setSection(s.v); setOpen(false); }} style={{
                  width: '100%',
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 8,
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: section === s.v ? 'var(--bg-2)' : 'transparent',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{
                      display: 'block',
                      fontSize: 12, fontWeight: section === s.v ? 600 : 500,
                      color: section === s.v ? 'var(--text-1)' : 'var(--text-2)',
                    }}>{s.label}</span>
                    <span style={{
                      display: 'block',
                      fontSize: 10, color: 'var(--text-3)',
                      fontFamily: 'var(--font-mono)', letterSpacing: 0.2,
                      marginTop: 1,
                    }}>{s.sub}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span className="mono" style={{
                      minWidth: 20, padding: '0 6px',
                      borderRadius: 9,
                      background: 'var(--bg-3)',
                      color: section === s.v ? 'var(--text-1)' : 'var(--text-2)',
                      fontSize: 9.5, fontWeight: 700,
                      textAlign: 'center',
                      lineHeight: '15px',
                    }}>{counts[s.v]}</span>
                    {unreads[s.v] > 0 && (
                      <span className="mono" style={{
                        minWidth: 20, padding: '0 6px',
                        borderRadius: 9,
                        background: 'var(--sig-danger)',
                        color: 'white',
                        fontSize: 9.5, fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: '15px',
                      }}>{unreads[s.v]}</span>
                    )}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 6 }}>
        {items.map(c => (
          <ChannelRow key={c.id} c={c} active={c.id === activeId} onClick={() => onSelect(c.id)} />
        ))}
        {items.length === 0 && (
          <div style={{
            padding: '24px 14px', textAlign: 'center',
            fontSize: 11.5, color: 'var(--text-3)',
          }}>
            Nothing here right now.
          </div>
        )}
      </div>
    </aside>
  );
}

// kept for completeness, but no longer rendered
function SectionRow() { return null; }

function ChannelRow({ c, active, onClick }) {
  const statusColor = c.status === 'awaiting' ? 'var(--sig-warn)'
                    : c.status === 'investigating' ? 'var(--sig-active)'
                    : c.status === 'resolved' ? 'var(--sig-ok)'
                    : 'var(--text-3)';
  const statusLabel = c.status === 'awaiting' ? 'AWAITING REVIEW'
                    : c.status === 'investigating' ? 'INVESTIGATING'
                    : c.status === 'resolved' ? 'RESOLVED'
                    : 'AUTO-RESOLVED';
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '7px 12px',
      background: active ? 'color-mix(in oklab, var(--c-customer) 8%, white)' : 'transparent',
      border: 'none', cursor: 'pointer',
      textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 3,
      fontFamily: 'inherit',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 6,
          background: c.priority === 'high' ? 'var(--sig-danger)' : c.priority === 'med' ? 'var(--sig-warn)' : 'var(--text-3)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 12.5, fontWeight: active ? 600 : (c.unread > 0 ? 600 : 500),
          color: 'var(--text-1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: 1, minWidth: 0,
        }}>
          {c.cust}
        </span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{c.when}</span>
      </div>
      <div style={{
        marginLeft: 13,
        fontSize: 10.5, color: 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6,
          minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <span className="mono" style={{ color: 'var(--text-2)', fontWeight: 500 }}>{c.amount}</span>
          <span style={{ color: 'var(--text-4)' }}>·</span>
          <span style={{ color: statusColor, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>{statusLabel}</span>
        </span>
        {c.unread > 0 && (
          <span style={{
            minWidth: 16, height: 14, padding: '0 4px',
            background: 'var(--sig-danger)', color: 'white',
            borderRadius: 7, fontSize: 9, fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{c.unread}</span>
        )}
      </div>
    </button>
  );
}

// ─── Chat header (Variation B, cleaned) ─────────────────────────────────
const PRIORITY_BADGE = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6,
  padding: '2px 6px', borderRadius: 3,
  background: 'color-mix(in oklab, var(--sig-danger) 12%, white)',
  color: 'var(--sig-danger)',
  fontFamily: 'var(--font-mono)',
};

function ChatHeader() {
  return (
    <div style={{
      padding: '12px 18px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-1)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20,
        background: 'color-mix(in oklab, var(--c-customer) 18%, white)',
        color: 'var(--c-customer)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: 14,
        border: '1px solid color-mix(in oklab, var(--c-customer) 30%, transparent)',
        flexShrink: 0,
      }}>SC</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: -0.2 }}>{CASE_META.customer.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{CASE_META.customer.tier} · since {CASE_META.customer.since}</span>
          <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>#</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{CASE_META.id}</span>
          <span style={PRIORITY_BADGE}>HIGH PRIORITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
          <span className="mono" style={{ color: 'var(--sig-danger)', fontWeight: 600 }}>{CASE_META.txn.amount}</span>
          <span>·</span>
          <span>{CASE_META.txn.merchant}</span>
          <span>·</span>
          <span>{CASE_META.txn.city}</span>
          <span>·</span>
          <span className="mono">{CASE_META.txn.time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Messages ───────────────────────────────────────────────────────────
function ChatStream({ onOpenAgent, mode }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  // Group consecutive messages by same author
  const groups = [];
  for (const m of MESSAGES) {
    const last = groups[groups.length - 1];
    const sameAuthor = last && last.type === m.type
      && (m.type === 'agent' ? last.agent === m.agent : (m.type === 'user' ? last.user === m.user : false));
    if (sameAuthor && m.type !== 'system' && m.type !== 'synthesis') {
      last.messages.push(m);
    } else {
      groups.push({ type: m.type, agent: m.agent, user: m.user, messages: [m] });
    }
  }

  return (
    <div ref={scrollRef} style={{
      flex: 1, overflow: 'auto', minHeight: 0,
      padding: '16px 18px 24px',
      background: 'var(--bg-0)',
    }}>
      <DateSeparator label="Today" />
      {groups.map((g, i) => {
        if (g.type === 'system') return <SystemMessage key={i} m={g.messages[0]} />;
        if (g.type === 'synthesis') return <SynthesisMessage key={i} m={g.messages[0]} />;
        if (g.type === 'user') return <UserMessageGroup key={i} g={g} />;
        return <AgentMessageGroup key={i} g={g} onOpenAgent={onOpenAgent} mode={mode} />;
      })}
      {/* typing indicator at bottom */}
      <TypingIndicator />
    </div>
  );
}

function DateSeparator({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 18px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}

function SystemMessage({ m }) {
  return (
    <div style={{ padding: '4px 0 10px', textAlign: 'center' }}>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.3 }}>
        <span style={{ marginRight: 6, color: 'var(--text-4)' }}>{m.ts}</span>
        {m.text}
      </span>
    </div>
  );
}

function AgentMessageGroup({ g, onOpenAgent, mode }) {
  const a = CHAT_AGENTS[g.agent];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '6px 0 12px' }}>
      <Avatar agent={g.agent} size={32} onClick={() => onOpenAgent(g.agent)} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <button onClick={() => onOpenAgent(g.agent)} style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'inherit',
          }}>{a.name}</button>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            color: a.color, letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: `color-mix(in oklab, ${a.color} 10%, white)`,
            border: `1px solid color-mix(in oklab, ${a.color} 20%, transparent)`,
          }}>AGENT</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{g.messages[0].ts}</span>
        </div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {g.messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {m.body.map((b, j) => <MessageBody key={j} b={b} agent={g.agent} mode={mode} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBody({ b, agent, mode }) {
  const a = CHAT_AGENTS[agent];
  if (b.kind === 'p' || b.kind === 'narrative') {
    return (
      <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.55 }}>
        {b.mention && (
          <Mention target={b.mention} />
        )}
        {b.mention && ' '}
        {b.text.replace(/^@\w+(\.\w+)?\s*/, '')}
      </div>
    );
  }
  if (b.kind === 'viz') {
    return <AgentViz viz={b.viz} />;
  }
  if (b.kind === 'inspect') {
    return <InspectQuery items={b.items} agent={agent} defaultOpen={mode === 'demo'} />;
  }
  if (b.kind === 'tool') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', marginTop: 2,
        background: 'var(--bg-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 5,
        maxWidth: '100%',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={a.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h8M6 2l4 4-4 4" />
        </svg>
        <span className="mono" style={{ fontSize: 10.5, color: a.color, fontWeight: 600 }}>{b.name}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)' }}>{b.q}</span>
      </div>
    );
  }
  if (b.kind === 'result') {
    return (
      <div className="mono" style={{
        fontSize: 11, color: 'var(--text-2)',
        padding: '2px 0 2px 14px',
        borderLeft: '2px solid var(--border)',
      }}>← {b.text}</div>
    );
  }
  if (b.kind === 'finding') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '7px 10px',
        background: 'color-mix(in oklab, var(--sig-warn) 8%, white)',
        border: '1px solid color-mix(in oklab, var(--sig-warn) 22%, transparent)',
        borderLeft: '3px solid var(--sig-warn)',
        borderRadius: 5,
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--sig-warn)" strokeWidth="1.8" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
          <path d="M7 2.5L1.5 11.5h11z" /><path d="M7 6v3" /><circle cx="7" cy="10.5" r=".5" fill="var(--sig-warn)" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: 'var(--sig-warn)', textTransform: 'uppercase' }}>Finding</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-1)', marginTop: 2, fontWeight: 500 }}>{b.text}</div>
        </div>
      </div>
    );
  }
  if (b.kind === 'file') {
    return <FileAttachment file={b} agent={agent} />;
  }
  return null;
}

function Mention({ target }) {
  if (target === 'maya') {
    return (
      <span style={{
        background: `color-mix(in oklab, ${ANALYST.color} 12%, white)`,
        color: ANALYST.color, padding: '0 5px', borderRadius: 3,
        fontWeight: 600, fontSize: 12.5,
      }}>@maya</span>
    );
  }
  const a = CHAT_AGENTS[target];
  return (
    <span style={{
      background: `color-mix(in oklab, ${a.color} 12%, white)`,
      color: a.color, padding: '0 5px', borderRadius: 3,
      fontWeight: 600, fontSize: 12.5,
    }}>@{a.id}.history</span>
  );
}

function getExt(name) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : 'file';
}

function FileAttachment({ file, agent }) {
  const ext = getExt(file.name);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '7px 10px',
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      maxWidth: 320,
    }}>
      <div style={{
        width: 26, height: 32, position: 'relative',
        background: 'var(--bg-2)',
        border: '1px solid var(--border-strong)',
        borderRadius: 3,
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 7, height: 7,
          background: 'var(--bg-1)',
          borderLeft: '1px solid var(--border-strong)',
          borderBottom: '1px solid var(--border-strong)',
        }} />
        <div style={{
          position: 'absolute', bottom: 3, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 700,
          color: 'var(--text-2)', letterSpacing: 0.4,
        }}>{ext.toUpperCase()}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{file.size} · drive9</div>
      </div>
    </div>
  );
}

function UserMessageGroup({ g }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '6px 0 12px' }}>
      <Avatar user={ANALYST} size={32} />
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{ANALYST.name}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            color: ANALYST.color, letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: `color-mix(in oklab, ${ANALYST.color} 10%, white)`,
            border: `1px solid color-mix(in oklab, ${ANALYST.color} 22%, transparent)`,
          }}>ANALYST</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{g.messages[0].ts}</span>
        </div>
        {g.messages.map((m, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.55, marginTop: 4 }}>
            <ParsedText text={m.text} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ParsedText({ text }) {
  // Split on @mentions
  const parts = text.split(/(@\w+(?:\.\w+)?)/g);
  return parts.map((p, i) => {
    if (p.startsWith('@')) {
      const target = p.slice(1).split('.')[0];
      if (CHAT_AGENTS[target] || target === 'maya') {
        return <Mention key={i} target={target} />;
      }
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// Special action card — the synthesized recommended action
function ActionMessage({ m, onOpenAgent }) {
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '6px 0 12px' }}>
      <Avatar agent={m.agent} size={32} onClick={() => onOpenAgent(m.agent)} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{CHAT_AGENTS[m.agent].name}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            color: 'var(--sig-active)', letterSpacing: 0.5,
            padding: '1px 5px', borderRadius: 3,
            background: 'color-mix(in oklab, var(--sig-active) 10%, white)',
            border: '1px solid color-mix(in oklab, var(--sig-active) 22%, transparent)',
          }}>SYNTHESIZED</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{m.ts}</span>
        </div>
        <div style={{
          marginTop: 6,
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderLeft: phase === 'done' ? '3px solid var(--sig-ok)' : '3px solid var(--sig-active)',
          borderRadius: 7,
          overflow: 'hidden',
          maxWidth: 560,
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 32, position: 'relative',
              background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 3,
              flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, background: 'var(--bg-1)', borderLeft: '1px solid var(--border-strong)', borderBottom: '1px solid var(--border-strong)' }} />
              <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: 0.4 }}>MD</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-1)' }}>{m.file}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{m.summary}</div>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
              color: phase === 'done' ? 'var(--sig-ok)' : 'var(--sig-active)',
            }}>
              {phase === 'ready' && 'AWAITING'}
              {phase === 'executing' && 'EXECUTING'}
              {phase === 'done' && '✓ EXECUTED'}
            </span>
          </div>
          <div style={{ padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 6 }}>CITED EVIDENCE</div>
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

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 6 }}>ACTIONS ON EXECUTE</div>
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
                    padding: '7px 14px', border: 'none',
                    background: 'var(--sig-ok)', color: 'white',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                    borderRadius: 5, cursor: 'pointer',
                  }}>Execute 4 actions →</button>
                  <button style={{
                    padding: '7px 10px', border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-2)', fontFamily: 'inherit', fontSize: 11.5,
                    borderRadius: 5, cursor: 'pointer',
                  }}>Edit</button>
                  <button style={{
                    padding: '7px 10px', border: '1px solid var(--border)', background: 'transparent',
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
                    ✓ EXECUTED · DSP-9921 opened · pattern saved to mem9
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

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 0', marginTop: 4, marginLeft: 52,
      fontSize: 11.5, color: 'var(--text-3)',
    }}>
      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--c-network)' }} />
      <span><b style={{ color: 'var(--text-2)', fontWeight: 600 }}>Network Graph</b> is looking up adjacent clusters…</span>
    </div>
  );
}

// ─── Composer ───────────────────────────────────────────────────────────
function Composer() {
  const [val, setVal] = React.useState('');
  const suggestions = [
    'Ask @network for ring depth',
    'Request 2nd opinion from policy',
    'Reject — false positive',
    'Escalate to senior team',
  ];

  return (
    <div style={{
      padding: '10px 18px 14px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-1)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setVal(s)} style={{
            padding: '3px 9px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-2)',
            borderRadius: 12, fontSize: 11,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px',
        border: '1px solid var(--border)',
        borderRadius: 7,
        background: 'var(--bg-1)',
      }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Message #CASE-2461 · @customer @merchant @network @policy"
          style={{
            flex: 1,
            border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 13,
            color: 'var(--text-1)',
            background: 'transparent',
          }}
        />
        <button disabled={!val.trim()} style={{
          padding: '4px 10px', border: 'none',
          background: val.trim() ? 'var(--text-1)' : 'var(--bg-3)',
          color: val.trim() ? 'white' : 'var(--text-4)',
          fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600,
          borderRadius: 5, cursor: val.trim() ? 'pointer' : 'not-allowed',
        }}>Send</button>
      </div>
    </div>
  );
}

// ─── Members + pinned panel ─────────────────────────────────────────────
function MembersPanel({ onOpenAgent, open, onToggle, mode, onChangeMode }) {
  const agentStatuses = { customer: 'done', merchant: 'done', network: 'working', policy: 'done' };

  if (!open) {
    return (
      <aside style={{
        width: 44, minWidth: 44,
        background: 'var(--bg-1)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '8px 0',
        minHeight: 0,
      }}>
        <button onClick={onToggle} title="Show details"
          style={{
            width: 26, height: 26, padding: 0,
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: 5, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-2)', marginBottom: 8,
          }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8 2L4 6L8 10" />
          </svg>
        </button>
        <ModeToggle mode={mode} onChange={onChangeMode} compact />
        <div style={{ width: 18, height: 1, background: 'var(--border-subtle)', margin: '10px 0 8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {Object.keys(CHAT_AGENTS).map(k => (
            <Avatar key={k} agent={k} size={24} onClick={() => onOpenAgent(k)} status={agentStatuses[k]} />
          ))}
          <div style={{ width: 12, height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />
          {TEAM_MEMBERS.map(m => (
            <span key={m.id} title={`${m.name} · ${m.role}`} style={{
              width: 24, height: 24, borderRadius: 12,
              background: `color-mix(in oklab, ${m.color} 18%, white)`,
              color: m.color, fontFamily: 'var(--font-mono)',
              fontSize: 10, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid color-mix(in oklab, ${m.color} 30%, transparent)`,
            }}>{m.short}</span>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 280, minWidth: 280,
      background: 'var(--bg-1)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: 0,
    }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={onToggle} title="Collapse"
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
        <ModeToggle mode={mode} onChange={onChangeMode} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* Customer block */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 8 }}>CUSTOMER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'color-mix(in oklab, var(--c-customer) 18%, white)',
              color: 'var(--c-customer)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 13,
              border: '1px solid color-mix(in oklab, var(--c-customer) 30%, transparent)',
            }}>SC</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{CASE_META.customer.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{CASE_META.customer.tier} · since {CASE_META.customer.since}</div>
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)' }}>{CASE_META.customer.id}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)' }}>{CASE_META.customer.email}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)' }}>{CASE_META.customer.phone}</div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-2)', border: '1px solid var(--border-subtle)', borderRadius: 5 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6, marginBottom: 3 }}>CUSTOMER CONTACT</div>
            <div style={{ fontSize: 11, color: 'var(--text-1)', fontStyle: 'italic', lineHeight: 1.5 }}>"{CASE_META.contact.replace('Customer reached out via app: ', '').replace(/^"|"$/g, '')}"</div>
          </div>
        </div>

        {/* Agents in channel */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>AGENTS · {Object.keys(CHAT_AGENTS).length}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-4)' }}>tap to inspect</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.keys(CHAT_AGENTS).map(k => {
              const a = CHAT_AGENTS[k];
              const s = agentStatuses[k];
              return (
                <button key={k} onClick={() => onOpenAgent(k)} style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center',
                  padding: '5px 6px', borderRadius: 5,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
                   onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <Avatar agent={k} size={26} status={s} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{a.role}</div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                    color: s === 'working' ? 'var(--sig-active)' : s === 'done' ? 'var(--sig-ok)' : 'var(--text-3)',
                    letterSpacing: 0.5,
                  }}>{s === 'working' ? 'WORKING' : s === 'done' ? 'DONE' : 'IDLE'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team — humans on this case */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600 }}>TEAM · {TEAM_MEMBERS.length}</span>
            <button style={{
              fontFamily: 'inherit', fontSize: 10.5, color: 'var(--c-customer)',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              fontWeight: 500,
            }}>+ Invite</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TEAM_MEMBERS.map(m => (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr', gap: 10, alignItems: 'center',
                padding: '5px 6px', borderRadius: 5,
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: `color-mix(in oklab, ${m.color} 18%, white)`,
                  color: m.color, fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid color-mix(in oklab, ${m.color} 30%, transparent)`,
                }}>{m.short}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {m.name}
                    {m.isYou && (
                      <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: 0.4 }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 8 }}>PINNED · 5 FILES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { name: 'recommended_action.md', a: 'policy', size: '1.2 KB' },
              { name: 'customer_pattern_anomaly.md', a: 'customer', size: '2.1 KB' },
              { name: 'merchant_risk_report.md', a: 'merchant', size: '3.4 KB' },
              { name: 'network_graph.json', a: 'network', size: '11.8 KB' },
              { name: 'policy_match.md', a: 'policy', size: '1.7 KB' },
            ].map(f => {
              const a = CHAT_AGENTS[f.a];
              return (
                <div key={f.name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 7px', borderRadius: 5,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 9,
                    background: `color-mix(in oklab, ${a.color} 22%, white)`,
                    color: a.color, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{a.glyph}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{f.size}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Agent profile drawer ───────────────────────────────────────────────
function AgentProfileDrawer({ agentKey, onClose }) {
  if (!agentKey) return null;
  const a = CHAT_AGENTS[agentKey];
  const h = AGENT_HISTORY[agentKey];
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(2px)',
        zIndex: 50,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 380, background: 'var(--bg-1)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-pop)',
        zIndex: 51,
        display: 'flex', flexDirection: 'column',
        animation: 'claims-rowin .25s ease-out',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Avatar agent={agentKey} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{a.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{a.role}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  color: 'var(--sig-ok)', letterSpacing: 0.6,
                  padding: '2px 7px', borderRadius: 3,
                  background: 'color-mix(in oklab, var(--sig-ok) 12%, white)',
                  border: '1px solid color-mix(in oklab, var(--sig-ok) 22%, transparent)',
                }}>● ONLINE</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              padding: 4, width: 24, height: 24,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', borderRadius: 4,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 3L11 11M11 3L3 11" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, marginTop: 12 }}>
            {a.about}
          </div>
        </div>

        {/* Today stats */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 10 }}>TODAY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <Stat label="Cases" value={h.todayStats.cases} />
            <Stat label="Findings" value={h.todayStats.findings} />
            <Stat label="Facts → mem9" value={h.todayStats.facts} />
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-3)', letterSpacing: 0.8, fontWeight: 600, marginBottom: 10 }}>RECENT ACTIVITY</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {h.activity.map((act, i) => (
              <div key={i} style={{
                padding: '8px 0',
                borderTop: i ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 600 }}>{act.case}</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-4)' }}>{act.when}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.45 }}>{act.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <a href="Stack Detail.html" style={{
            fontSize: 11.5, color: 'var(--c-customer)',
            textDecoration: 'none', fontFamily: 'inherit',
          }}>See how agents work →</a>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: 0.6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginTop: 3 }}>{value}</div>
    </div>
  );
}

// ─── Top-level page ─────────────────────────────────────────────────────
function CaseChatApp() {
  const [activeChannel, setActiveChannel] = React.useState('CASE-2461');
  const [profileAgent, setProfileAgent] = React.useState(null);
  const [mode, setMode] = React.useState('persona'); // 'persona' | 'demo'
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [toastKey, setToastKey] = React.useState(0); // bump to retrigger the toast
  const [toastOpen, setToastOpen] = React.useState(false);

  const onChangeMode = (m) => {
    setMode(m);
    setPanelOpen(true);
  };

  const onNewCase = () => {
    setToastKey(k => k + 1);
    setToastOpen(true);
  };

  React.useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 8000);
    return () => clearTimeout(t);
  }, [toastOpen, toastKey]);

  return (
    <div className="claims-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <AppHeader onNewCase={onNewCase} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <ChannelsSidebar activeId={activeChannel} onSelect={setActiveChannel} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <ChatHeader />
          <ChatStream onOpenAgent={setProfileAgent} mode={mode} />
          <Composer />
        </main>
        {mode === 'demo'
          ? (panelOpen
              ? <UnderHoodPanel
                  onCollapse={() => setPanelOpen(false)}
                  modeToggle={<ModeToggle mode={mode} onChange={onChangeMode} />}
                />
              : <CollapsedRailToggle onOpen={() => setPanelOpen(true)} mode={mode} onChangeMode={onChangeMode} label="UNDER THE HOOD" />
            )
          : <MembersPanel
              onOpenAgent={setProfileAgent}
              open={panelOpen}
              onToggle={() => setPanelOpen(o => !o)}
              mode={mode}
              onChangeMode={onChangeMode}
            />
        }
        <AgentProfileDrawer agentKey={profileAgent} onClose={() => setProfileAgent(null)} />
        <NewCaseToast key={toastKey} open={toastOpen} onClose={() => setToastOpen(false)} onTap={() => { setToastOpen(false); setActiveChannel('CASE-2461'); }} />
      </div>
    </div>
  );
}

// Push-notification style toast that appears when the analyst hits "New case".
// Looks like a banking app push: bank glyph, app name, just now, subject line,
// amount + merchant + city, tap-to-review CTA. Auto-dismisses on a timer.
function NewCaseToast({ open, onClose, onTap }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', top: 14, right: 16,
      zIndex: 60,
      width: 340,
      animation: 'claims-toastin .35s cubic-bezier(.2,.7,.2,1.1)',
    }}>
      <div style={{
        background: 'color-mix(in oklab, white 92%, var(--bg-1))',
        backdropFilter: 'saturate(140%) blur(8px)',
        WebkitBackdropFilter: 'saturate(140%) blur(8px)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: '0 18px 40px rgba(10, 31, 68, 0.18), 0 2px 8px rgba(10, 31, 68, 0.08), 0 0 0 1px rgba(10, 31, 68, 0.03)',
        overflow: 'hidden',
      }}>
        {/* Header strip — bank name + just now */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 0',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: 5,
            background: 'linear-gradient(135deg, var(--c-customer), var(--c-merchant))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700,
            boxShadow: '0 1px 2px rgba(10,31,68,0.18)',
          }}>$</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 600, letterSpacing: -0.1 }}>
            Bank of CLAiMS
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· just now</span>
          <button onClick={onClose} title="Dismiss"
            style={{
              marginLeft: 'auto',
              width: 18, height: 18, padding: 0,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-4)', borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3L9 9M9 3L3 9" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '6px 14px 12px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginTop: 2, letterSpacing: -0.15 }}>
            Verify a charge
          </div>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.45 }}>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--sig-danger)' }}>$4,280.00</span>
            <span style={{ color: 'var(--text-2)' }}> at PT Sunset Holdings</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>
            Bali, ID
          </div>
          <button onClick={onTap} style={{
            marginTop: 10,
            width: '100%',
            padding: '7px 10px',
            background: 'var(--text-1)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: -0.1,
          }}>
            Tap to review
          </button>
        </div>
      </div>
    </div>
  );
}

function CollapsedRailToggle({ onOpen, mode, onChangeMode, label }) {
  return (
    <aside style={{
      width: 44, minWidth: 44,
      background: 'var(--bg-1)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 0',
      minHeight: 0,
    }}>
      <button onClick={onOpen} title="Expand panel"
        style={{
          width: 26, height: 26, padding: 0,
          background: 'transparent', border: '1px solid var(--border-subtle)',
          borderRadius: 5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', marginBottom: 8,
        }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 2L4 6L8 10" />
        </svg>
      </button>
      <ModeToggle mode={mode} onChange={onChangeMode} compact />
      <div style={{ width: 18, height: 1, background: 'var(--border-subtle)', margin: '10px 0 8px' }} />
      <div style={{
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        fontFamily: 'var(--font-mono)', fontSize: 9.5,
        color: 'var(--text-3)', letterSpacing: 1, fontWeight: 600,
      }}>{label}</div>
    </aside>
  );
}

Object.assign(window, { CaseChatApp });
