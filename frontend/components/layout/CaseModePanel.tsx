"use client";

import type { AgentId, AgentLaneStatus, Case } from "@/types/api";
import { AGENT_META, TEAM_MEMBERS } from "@/lib/agents";
import { STACK_DATA } from "@/mocks/data/stack";
import { useCaseStreamStore } from "@/lib/store/case-stream";

type Props = { caseDetail: Case };

export function CaseModePanel({ caseDetail }: Props) {
  const c = caseDetail.customer_detail;
  // Live agent lane status comes from the SSE stream — flips
  // idle → working → done as agent_status events arrive.
  const agentStatus = useCaseStreamStore((s) => s.agentStatus);
  return (
    <div className="flex-1 overflow-auto min-h-0">
      {/* CUSTOMER */}
      <PanelLabel>CUSTOMER</PanelLabel>
      <div className="px-[14px] pb-3">
        <div className="flex items-start gap-3">
          <div
            className="mono w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{
              background: "color-mix(in oklab, var(--c-customer) 18%, white)",
              color: "var(--c-customer)",
              border: "1px solid color-mix(in oklab, var(--c-customer) 35%, transparent)",
            }}
            aria-hidden
          >
            {c.initials}
          </div>
          <div className="min-w-0 leading-[1.35]">
            <div className="text-[13px] font-semibold text-ink">{c.name}</div>
            <div className="text-[11px] text-ink-subtle">
              {c.tier} · since {c.since}
            </div>
            <div className="mono text-[11px] text-ink-muted mt-px">
              {c.email}
            </div>
            <div className="mono text-[11px] text-ink-muted">+1 {c.phone.replace("+1 ", "")}</div>
          </div>
        </div>
      </div>

      {/* NOTE */}
      {caseDetail.contact && (
        <>
          <PanelLabel>NOTE</PanelLabel>
          <div className="px-[14px] pb-3">
            <div
              className="rounded-[5px] px-[10px] py-[8px] text-[11.5px] italic leading-[1.5]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border-subtle)",
                borderLeft: "3px solid var(--border-strong)",
                color: "var(--text-2)",
              }}
            >
              {stripPrefix(caseDetail.contact)}
            </div>
          </div>
        </>
      )}

      {/* AGENTS */}
      <PanelLabel>AGENTS</PanelLabel>
      <div className="px-[14px] pb-3 flex flex-col gap-[10px]">
        {Object.values(AGENT_META).map((a) => (
          <AgentRow key={a.id} agentId={a.id} status={agentStatus[a.id]} />
        ))}
      </div>

      {/* TEAM */}
      <PanelLabel right={<RightLink label="+ invite" />}>TEAM</PanelLabel>
      <div className="px-[14px] pb-3 flex flex-col gap-[10px]">
        {TEAM_MEMBERS.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <span
              className="mono w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: `color-mix(in oklab, ${m.color} 18%, white)`,
                color: m.color,
                border: `1px solid color-mix(in oklab, ${m.color} 35%, transparent)`,
              }}
            >
              {m.initials}
            </span>
            <div className="min-w-0 leading-[1.3]">
              <div className="text-[12.5px] font-medium text-ink">{m.name}</div>
              <div className="text-[10.5px] text-ink-subtle">{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PINNED FILES */}
      <PanelLabel>PINNED FILES · {STACK_DATA.drive9.pinned}</PanelLabel>
      <div className="px-[14px] pb-3 flex flex-col gap-[6px]">
        {STACK_DATA.drive9.files.map((f) => {
          const a = AGENT_META[f.agent];
          return (
            <div key={f.name} className="flex items-center gap-2">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: a.color }}
              />
              <span className="mono text-[10.5px] text-ink truncate">
                {f.name}
              </span>
              <span className="text-[10px] text-ink-faint ml-auto shrink-0">
                {f.size}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PanelLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-[14px] pt-3 pb-[6px] flex items-baseline gap-[6px]">
      <span className="mono text-[10px] font-bold tracking-[0.8px] text-ink-subtle">
        {children}
      </span>
      <span className="flex-1" />
      {right}
    </div>
  );
}

function RightLink({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="text-[10.5px] text-ink-subtle hover:text-ink-muted no-underline"
    >
      {label}
    </a>
  );
}

function AgentRow({
  agentId,
  status,
}: {
  agentId: AgentId;
  status: AgentLaneStatus;
}) {
  const a = AGENT_META[agentId];
  return (
    <div className="flex items-center gap-2">
      <span
        className="mono w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{
          background: `color-mix(in oklab, ${a.color} 18%, white)`,
          color: a.color,
          border: `1px solid color-mix(in oklab, ${a.color} 35%, transparent)`,
        }}
      >
        {a.glyph}
      </span>
      <div className="min-w-0 leading-[1.3]">
        <div className="text-[12.5px] font-medium text-ink">{a.name}</div>
        <div className="text-[10.5px] text-ink-subtle">{a.role}</div>
      </div>
      <StatusPill status={status} />
    </div>
  );
}

function StatusPill({ status }: { status: AgentLaneStatus }) {
  const map: Record<AgentLaneStatus, { color: string; label: string; pulse: boolean }> = {
    idle: { color: "var(--sig-idle)", label: "IDLE", pulse: false },
    working: { color: "var(--sig-active)", label: "WORKING", pulse: true },
    waiting: { color: "var(--sig-warn)", label: "WAITING", pulse: true },
    done: { color: "var(--sig-ok)", label: "DONE", pulse: false },
  };
  const s = map[status];
  return (
    <span
      className="mono inline-flex items-center gap-[5px] ml-auto px-[6px] py-[2px] rounded-[3px] text-[9px] font-semibold tracking-[0.6px] leading-none shrink-0"
      style={{
        background: `color-mix(in oklab, ${s.color} 14%, transparent)`,
        color: s.color,
      }}
    >
      <span
        className={s.pulse ? "pulse-dot" : ""}
        style={{
          width: 5,
          height: 5,
          borderRadius: 5,
          background: s.color,
        }}
      />
      {s.label}
    </span>
  );
}

function stripPrefix(text: string): string {
  return text.replace(/^Customer reached out via app:\s*/, "");
}
