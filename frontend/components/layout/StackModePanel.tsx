import { STACK_DATA, type FactEntry, type PinnedFile, type QueryLogEntry } from "@/mocks/data/stack";
import { AGENT_META } from "@/lib/agents";

// Under the Hood telemetry — TiDB query log, mem9 facts, drive9 pinned.
// Static in Phase 1 (no live streaming).
export function StackModePanel() {
  const m = STACK_DATA.metrics;
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Header block */}
      <div className="px-[14px] pt-3 pb-[6px] flex items-baseline justify-between">
        <div>
          <div className="mono text-[9.5px] font-bold tracking-[0.8px] text-ink-subtle">
            UNDER THE HOOD
          </div>
          <div className="text-[11px] text-ink-subtle mt-px">
            How <span className="text-ink font-semibold">TiDB</span>,{" "}
            <span className="text-ink font-semibold">mem9</span>, and{" "}
            <span className="text-ink font-semibold">drive9</span> power this case.
          </div>
        </div>
        <span className="mono text-[9.5px] text-ink-faint">live</span>
      </div>

      {/* Metrics strip */}
      <div
        className="mx-3 my-2 px-3 py-[10px] rounded-md grid grid-cols-2 gap-[10px]"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Metric label="QPS" value={m.qps.toLocaleString()} />
        <Metric label="P99" value={m.p99} />
        <Metric label="VEC SEARCHES" value={String(m.vector)} />
        <Metric label="HTAP" value={m.htap} small />
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-auto min-h-0">
        <Section
          title="TiDB · query log"
          badge={`${STACK_DATA.queries.length} queries`}
        >
          {STACK_DATA.queries.map((q, i) => (
            <QueryLine key={i} q={q} />
          ))}
        </Section>

        <Section
          title="mem9 · facts"
          badge={`${STACK_DATA.mem9.read} read · ${STACK_DATA.mem9.queued} queued`}
        >
          {STACK_DATA.mem9.facts.map((f) => (
            <FactLine key={f.id} f={f} />
          ))}
        </Section>

        <Section
          title="drive9 · pinned"
          badge={`${STACK_DATA.drive9.pinned} files`}
          last
        >
          {STACK_DATA.drive9.files.map((f) => (
            <FileLine key={f.name} f={f} />
          ))}
        </Section>
      </div>

      {/* Footer */}
      <div
        className="px-[14px] py-2 flex items-center gap-2 text-[10px] text-ink-subtle"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-2)",
        }}
      >
        <span
          className="pulse-dot w-[6px] h-[6px] rounded-[3px] shrink-0"
          style={{ background: "var(--sig-ok)" }}
        />
        <span className="mono">{STACK_DATA.region}</span>
        <span className="mono ml-auto text-ink-faint">{STACK_DATA.version}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="mono text-[8.5px] font-semibold tracking-[0.7px] text-ink-subtle">
        {label}
      </div>
      <div
        className="mono font-semibold text-ink mt-[2px] truncate"
        style={{ fontSize: small ? 11 : 15 }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
  last,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="pb-2"
      style={{ borderBottom: last ? undefined : "1px solid var(--border-subtle)" }}
    >
      <div className="px-[14px] pt-[10px] pb-[6px] flex items-baseline justify-between">
        <span className="mono text-[9.5px] font-bold tracking-[0.7px] text-ink-subtle">
          {title}
        </span>
        <span className="mono text-[9.5px] text-ink-faint">{badge}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

const KIND_COLOR: Record<QueryLogEntry["kind"], string> = {
  OLTP: "var(--sig-active)",
  OLAP: "var(--c-merchant)",
  VEC: "var(--c-network)",
  GRAPH: "var(--sig-danger)",
};

function QueryLine({ q }: { q: QueryLogEntry }) {
  const a = AGENT_META[q.agent];
  return (
    <div
      className="mono row-in py-[2px] px-[14px] grid items-center gap-[7px] text-[10px] leading-[1.5]"
      style={{ gridTemplateColumns: "46px 38px 1fr auto" }}
    >
      <span className="text-ink-faint">{q.ts.slice(-9, -4)}</span>
      <span
        className="font-bold text-[9px] tracking-[0.5px]"
        style={{ color: KIND_COLOR[q.kind] }}
      >
        {q.kind}
      </span>
      <span className="flex items-center gap-[6px] min-w-0">
        <span
          className="w-1 h-1 rounded-[2px] shrink-0"
          style={{ background: a.color }}
        />
        <span className="text-ink font-medium truncate">{q.table}</span>
        {q.note && (
          <span className="text-ink-subtle text-[9.5px] truncate">
            · {q.note}
          </span>
        )}
      </span>
      <span className="text-ink-subtle text-[9.5px] text-right whitespace-nowrap">
        {q.rows} · {q.latency}
      </span>
    </div>
  );
}

function FactLine({ f }: { f: FactEntry }) {
  const op = f.op;
  const opColor =
    op === "WRITE"
      ? "var(--sig-ok)"
      : op === "QUEUED"
        ? "var(--sig-warn)"
        : "var(--sig-active)";
  const a = AGENT_META[f.agent];
  return (
    <div
      className="mono py-[3px] px-[14px] grid items-center gap-[7px] text-[10px] leading-[1.5]"
      style={{ gridTemplateColumns: "52px 12px 1fr" }}
    >
      <span
        className="font-bold text-[9px] tracking-[0.5px]"
        style={{ color: opColor }}
      >
        {op}
      </span>
      <span
        className="w-1 h-1 rounded-[2px]"
        style={{ background: a.color }}
      />
      <span className="text-ink truncate">{f.text}</span>
    </div>
  );
}

function FileLine({ f }: { f: PinnedFile }) {
  const a = AGENT_META[f.agent];
  return (
    <div
      className="mono py-[2px] px-[14px] grid items-center gap-[7px] text-[10px] leading-[1.5]"
      style={{ gridTemplateColumns: "12px 1fr auto" }}
    >
      <span
        className="w-1 h-1 rounded-[2px]"
        style={{ background: a.color }}
      />
      <span className="text-ink truncate">{f.name}</span>
      <span className="text-ink-faint text-[9.5px]">{f.size}</span>
    </div>
  );
}
