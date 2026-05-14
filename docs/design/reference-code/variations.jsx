// Component variations: mem9 treatments, drive9 treatments, approval flows.

// ─── mem9 treatments ────────────────────────────────────────

function Mem9_Spine() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>mem9 — spine of facts</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>chips ordered by time, dots show which agents have read</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
        {MEM9.map(f => <MemChip key={f.id} fact={f} />)}
      </div>
    </div>
  );
}

function Mem9_Graph() {
  // 4 agents around a center mem9 node, with edges weighted by writes
  const W = 320, H = 280;
  const cx = W / 2, cy = H / 2 + 6;
  const positions = {
    customer: { x: cx - 110, y: cy - 70 },
    merchant: { x: cx + 110, y: cy - 70 },
    network:  { x: cx - 110, y: cy + 70 },
    policy:   { x: cx + 110, y: cy + 70 },
  };
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>mem9 — node graph</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>agents as nodes, lines pulse when a memory is read</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, margin: 'auto' }}>
          {Object.entries(positions).map(([k, p]) => (
            <line key={k} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={AGENTS[k].color} strokeWidth="1.5" opacity="0.55" strokeDasharray="3 3">
              <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.2s" repeatCount="indefinite" />
            </line>
          ))}
          {/* center mem9 */}
          <circle cx={cx} cy={cy} r="32" fill="var(--bg-2)" stroke="var(--border-strong)" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--text-1)" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>mem9</text>
          <text x={cx} y={cy + 11} textAnchor="middle" fill="var(--text-3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>{MEM9.length} facts</text>
          {/* agent nodes */}
          {Object.entries(positions).map(([k, p]) => {
            const a = AGENTS[k];
            return (
              <g key={k}>
                <circle cx={p.x} cy={p.y} r="22" fill="var(--bg-2)" stroke={a.color} strokeWidth="1.5" />
                <text x={p.x} y={p.y + 3} textAnchor="middle" fill={a.color} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>{a.glyph}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Mem9_Feed() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>mem9 — chronological feed</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>log of writes with reader avatars</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'auto' }}>
        {MEM9.map(f => {
          const a = AGENTS[f.author];
          return (
            <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 9, color: 'var(--text-4)' }}>{f.t}</span>
              <div>
                <div style={{ fontSize: 9, color: a.color, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.4 }}>{a.short} wrote</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-1)', marginTop: 1 }}>{f.text}</div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {f.readBy.map(r => (
                  <span key={r} style={{ width: 14, height: 14, borderRadius: 3, background: `color-mix(in oklab, ${AGENTS[r].color} 22%, transparent)`, color: AGENTS[r].color, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{AGENTS[r].glyph}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── drive9 treatments ──────────────────────────────────────

function Drive9_Rows() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>drive9 — sliding rows</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>files slide in as agents finish</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
        {DRIVE9.map((f, i) => <DriveFile key={f.name} file={f} just={i === DRIVE9.length - 1} />)}
      </div>
    </div>
  );
}

function Drive9_Stack() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>drive9 — growing stack</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>pack thickness signals progress</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 200 }}>
          {DRIVE9.map((f, i) => {
            const a = AGENTS[f.author];
            const c = a ? a.color : 'var(--text-3)';
            return (
              <div key={f.name} style={{
                position: 'absolute',
                left: i * 6, top: i * 8,
                width: 200, height: 60,
                background: 'var(--bg-2)',
                border: `1px solid color-mix(in oklab, ${c} 30%, var(--border))`,
                borderLeft: `2px solid ${c}`,
                borderRadius: 4,
                padding: '8px 10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-1)' }}>{f.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{f.preview}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'center' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{DRIVE9.length} files · 19.9KB</span>
        </div>
      </div>
    </div>
  );
}

function Drive9_Folder() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>drive9 — opened folder</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>file icons in a grid</div>
      </div>
      <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignContent: 'flex-start' }}>
        {DRIVE9.map(f => {
          const a = AGENTS[f.author];
          const c = a ? a.color : 'var(--text-3)';
          return (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6, borderRadius: 4 }}>
              <div style={{ width: 44, height: 54, background: 'var(--bg-2)', border: `1px solid color-mix(in oklab, ${c} 30%, var(--border))`, borderRadius: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 6, left: 6, right: 6, height: 2, background: c, opacity: 0.7 }} />
                <div style={{ position: 'absolute', top: 12, left: 6, right: 6, height: 1.5, background: 'var(--text-4)' }} />
                <div style={{ position: 'absolute', top: 17, left: 6, right: 12, height: 1.5, background: 'var(--text-4)' }} />
                <div style={{ position: 'absolute', top: 22, left: 6, right: 8, height: 1.5, background: 'var(--text-4)' }} />
              </div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--text-1)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-all' }}>{f.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Approval flows ─────────────────────────────────────────

function Approval_Modal() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 320, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-pop)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Confirm approval</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>4 actions will fire on confirm</div>
          </div>
          <div style={{ padding: 8 }}>
            {[
              { t: 'Suspend card', d: '•••• 4421 · effective immediately' },
              { t: 'Issue provisional credit', d: '$4,280.00 to acct 8210' },
              { t: 'Open dispute case', d: 'Reg E §1005.11 · 10-day SLA' },
              { t: 'Write audit log + mem9', d: 'pattern → cluster_RING_142' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 8, padding: '7px 8px', alignItems: 'center' }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, border: '1px solid var(--sig-ok)', background: 'color-mix(in oklab, var(--sig-ok) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--sig-ok)" strokeWidth="2"><path d="M1 4l2 2 4-4"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{a.t}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{a.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <button style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', borderRadius: 5, fontSize: 12, fontFamily: 'var(--font-sans)' }}>Cancel</button>
            <button style={{ flex: 1, padding: '8px', border: 'none', background: 'var(--sig-ok)', color: '#06160d', borderRadius: 5, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Approve all →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Approval_Chain() {
  const steps = [
    { t: 'Card suspended', d: '•••• 4421', s: 'done', when: '0:00' },
    { t: 'Provisional credit issued', d: '+$4,280.00', s: 'done', when: '0:01' },
    { t: 'Dispute case opened', d: 'DSP-9921', s: 'working', when: '0:02' },
    { t: 'Audit log written', d: 'audit_2461.json', s: 'idle', when: '—' },
    { t: 'Pattern saved to mem9', d: 'cluster_RING_142', s: 'idle', when: '—' },
  ];
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'color-mix(in oklab, var(--sig-ok) 8%, var(--bg-1))' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--sig-ok)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>APPROVED · 03:14:48 PT</span>
        <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 4, fontWeight: 500 }}>Action chain executing</div>
      </div>
      <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        {steps.map((s, i) => {
          const sigColor = s.s === 'done' ? 'var(--sig-ok)' : s.s === 'working' ? 'var(--sig-active)' : 'var(--text-4)';
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, padding: '10px 0', position: 'relative' }}>
              {i < steps.length - 1 && <div style={{ position: 'absolute', left: 9, top: 22, bottom: -6, width: 1.5, background: s.s === 'done' ? 'var(--sig-ok)' : 'var(--border-subtle)' }} />}
              <span style={{ width: 18, height: 18, borderRadius: 18, background: s.s === 'idle' ? 'var(--bg-2)' : sigColor, border: `1px solid ${sigColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
                className={s.s === 'working' ? 'pulse-dot' : ''}>
                {s.s === 'done' && <svg width="9" height="9" viewBox="0 0 8 8" fill="none" stroke="#06160d" strokeWidth="2.2"><path d="M1 4l2 2 4-4"/></svg>}
              </span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{s.t}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{s.d}</div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{s.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Approval_Hybrid() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>STEP 1 · CONFIRM</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>Inline checklist confirms scope before firing.</div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--sig-ok)', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--sig-ok)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>STEP 2 · WATCH</div>
          <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 4 }}>Each action animates as it executes.</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            {['Suspend', 'Credit', 'Dispute', 'Audit'].map((s, i) => (
              <div key={s} style={{ flex: 1, padding: '6px 8px', borderRadius: 4, background: i < 2 ? 'color-mix(in oklab, var(--sig-ok) 14%, transparent)' : 'var(--bg-2)', border: `1px solid ${i < 2 ? 'var(--sig-ok)' : 'var(--border-subtle)'}`, fontSize: 10, color: i < 2 ? 'var(--sig-ok)' : 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s}</div>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>STEP 3 · RECEIPT</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>Audit hash + dispute ID surfaced for the analyst.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Additional screens ─────────────────────────────────────

function ScreenQueue() {
  const cases = [
    { id: 'CASE-2461', name: 'Sarah Chen', amt: '$4,280', risk: 'high', tier: 'Premium', when: '2m', status: 'Investigating' },
    { id: 'CASE-2460', name: 'David Kim', amt: '$1,840', risk: 'high', tier: 'Standard', when: '5m', status: 'Investigating' },
    { id: 'CASE-2459', name: 'Maria Lopez', amt: '$420', risk: 'med', tier: 'Premium', when: '12m', status: 'Awaiting analyst' },
    { id: 'CASE-2458', name: 'Tom Hayashi', amt: '$78', risk: 'ok', tier: 'Standard', when: '14m', status: 'Auto-resolved' },
    { id: 'CASE-2457', name: 'Anika Patel', amt: '$3,100', risk: 'high', tier: 'Premium', when: '21m', status: 'Approved' },
    { id: 'CASE-2456', name: 'James OConnor', amt: '$220', risk: 'med', tier: 'Standard', when: '34m', status: 'Resolved' },
  ];
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <SectionLabel count={cases.length}>Queue · ranked by risk</SectionLabel>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {cases.map((c, i) => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '14px 90px 1fr 80px 100px 80px', gap: 10, alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--border-subtle)', background: i === 0 ? 'color-mix(in oklab, var(--sig-active) 5%, transparent)' : 'transparent' }}>
            <RiskDot level={c.risk} />
            <Mono size={11} color="var(--text-2)">{c.id}</Mono>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.tier}</div>
            </div>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>{c.amt}</span>
            <span style={{ fontSize: 10, color: c.status === 'Investigating' ? 'var(--sig-active)' : 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: 0.4 }}>
              {c.status === 'Investigating' && <span className="pulse-dot" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 5, background: 'var(--sig-active)', marginRight: 4 }} />}
              {c.status}
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right' }}>{c.when} ago</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenResolved() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <div style={{ padding: '12px 16px', background: 'color-mix(in oklab, var(--sig-ok) 8%, var(--bg-1))', borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--sig-ok)', fontWeight: 600, letterSpacing: 0.6 }}>RESOLVED · APPROVED</span>
        <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 4, fontWeight: 500 }}>Auto-hold + provisional credit</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)' }}>OUTCOME</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.5 }}>
            Card •••• 4421 suspended. $4,280.00 provisional credit issued to acct 8210.
            Dispute DSP-9921 opened under Reg E §1005.11.
          </div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
          <SectionLabel>Audit trail</SectionLabel>
          {[
            { t: '03:14:24', text: 'case opened · auto-triage' },
            { t: '03:14:26', text: '4 agents spawned' },
            { t: '03:14:50', text: 'all evidence in drive9' },
            { t: '03:14:51', text: 'analyst Maya Singh approved' },
            { t: '03:14:52', text: 'action chain executed' },
            { t: '03:14:53', text: 'pattern → mem9 (RING-142)' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 10, padding: '6px 12px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{r.t}</span>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenAgentDetail() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <LaneHead agent={AGENTS.network} status="working" t="0:24 elapsed" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>
          <div style={{ borderRight: '1px solid var(--border-subtle)', overflow: 'auto', padding: '8px 0' }}>
            {TRACES.network.map((tr, i) => <TraceLine key={i} entry={tr} color={AGENTS.network.color} last={i === TRACES.network.length - 1} />)}
          </div>
          <div style={{ background: 'var(--bg-1)', padding: 14, overflow: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>EVIDENCE PRODUCED</div>
            <DriveFile file={DRIVE9[2]} />
            <div style={{ marginTop: 14, fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>FACTS WRITTEN</div>
            {MEM9.filter(f => f.author === 'network').map(f => <div key={f.id} style={{ marginBottom: 6 }}><MemChip fact={f} /></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenMem9Explorer() {
  return (
    <div className="claims-root" style={{ height: '100%', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <CaseHeader compact />
      <SectionLabel count="2,847">mem9 explorer · all facts</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', flex: 1, minHeight: 0 }}>
        <div style={{ borderRight: '1px solid var(--border-subtle)', padding: 10, background: 'var(--bg-1)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>FILTER</div>
          {Object.values(AGENTS).map(a => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 11, color: 'var(--text-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: a.color }} />
              {a.name}
            </label>
          ))}
          <div style={{ marginTop: 14, fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 0.6, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>CLUSTERS</div>
          <div style={{ fontSize: 11, color: 'var(--sig-warn)', padding: '4px 0' }}>RING-142 (18)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 0' }}>RING-098 (11)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 0' }}>RING-061 (7)</div>
        </div>
        <div style={{ overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MEM9.map(f => <MemChip key={f.id} fact={f} />)}
          {MEM9.map(f => <MemChip key={f.id + 'b'} fact={{ ...f, t: '-1d' }} />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Mem9_Spine, Mem9_Graph, Mem9_Feed, Drive9_Rows, Drive9_Stack, Drive9_Folder, Approval_Modal, Approval_Chain, Approval_Hybrid, ScreenQueue, ScreenResolved, ScreenAgentDetail, ScreenMem9Explorer });
