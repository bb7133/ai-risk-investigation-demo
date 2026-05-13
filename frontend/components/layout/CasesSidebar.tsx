import { ChevronDown } from "lucide-react";
import type { CaseListItem } from "@/types/api";

type Props = {
  cases: CaseListItem[];
  activeCaseId: string;
  awaitingCount: number;
  highPriorityUnread: number;
};

export function CasesSidebar({
  cases,
  activeCaseId,
  awaitingCount,
  highPriorityUnread,
}: Props) {
  return (
    <aside className="w-[264px] shrink-0 bg-surface border-r border-line flex flex-col min-h-0">
      {/* CASES header */}
      <div className="px-[14px] pt-3 pb-[6px]">
        <span className="mono text-[10px] font-bold tracking-[0.8px] text-ink-subtle">
          CASES
        </span>
      </div>

      {/* Filter pill (visual only in Phase 1) */}
      <div className="px-[10px] pb-[10px]">
        <button
          type="button"
          className="w-full grid grid-cols-[1fr_auto_14px] items-center gap-2 rounded-md border border-line bg-surface px-[10px] py-2 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[12.5px] font-semibold text-ink truncate">
              Awaiting my review
            </span>
            <span className="mono block text-[10.5px] text-ink-subtle tracking-[0.2px] mt-px truncate">
              High priority
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="mono inline-flex items-center justify-center min-w-[22px] h-[17px] rounded-[10px] bg-row px-[7px] text-[10px] font-bold text-ink-muted">
              {awaitingCount}
            </span>
            <span
              className="mono inline-flex items-center justify-center min-w-[22px] h-[17px] rounded-[10px] px-[7px] text-[10px] font-bold text-white"
              style={{ background: "var(--sig-danger)" }}
            >
              {highPriorityUnread}
            </span>
          </span>
          <ChevronDown
            className="h-[11px] w-[11px] text-ink-subtle"
            strokeWidth={1.6}
          />
        </button>
      </div>

      {/* Case rows */}
      <div className="flex-1 overflow-auto pb-[6px]">
        {cases.map((c) => (
          <CaseRow key={c.id} c={c} active={c.id === activeCaseId} />
        ))}
      </div>
    </aside>
  );
}

function CaseRow({ c, active }: { c: CaseListItem; active: boolean }) {
  return (
    <div
      className="w-full px-3 py-[7px] flex flex-col gap-[3px]"
      style={
        active
          ? {
              background: "color-mix(in oklab, var(--c-customer) 8%, white)",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-[7px] min-w-0">
        <span
          className="w-[6px] h-[6px] rounded-full shrink-0"
          style={{
            background:
              c.priority === "high"
                ? "var(--sig-danger)"
                : c.priority === "med"
                  ? "var(--sig-warn)"
                  : "var(--text-3)",
          }}
        />
        <span
          className="flex-1 min-w-0 truncate text-[12.5px] text-ink"
          style={{ fontWeight: active || c.unread > 0 ? 600 : 500 }}
        >
          {c.customer}
        </span>
        <span className="mono text-[10px] text-ink-subtle shrink-0">
          {c.when}
        </span>
      </div>
      <div className="ml-[13px] flex items-center justify-between gap-2 text-[10.5px] text-ink-subtle">
        <span className="flex items-center gap-[6px] min-w-0 truncate">
          <span className="mono font-medium text-ink-muted">{c.amount}</span>
          <span className="text-ink-faint">·</span>
          <span
            className="mono text-[9px] font-semibold tracking-[0.5px]"
            style={{
              color:
                c.status === "awaiting"
                  ? "var(--sig-warn)"
                  : c.status === "investigating"
                    ? "var(--sig-active)"
                    : "var(--sig-ok)",
            }}
          >
            {c.status === "awaiting"
              ? "AWAITING REVIEW"
              : c.status === "investigating"
                ? "INVESTIGATING"
                : c.status === "resolved"
                  ? "RESOLVED"
                  : "AUTO-RESOLVED"}
          </span>
        </span>
        {c.unread > 0 && (
          <span
            className="mono inline-flex items-center justify-center min-w-[16px] h-[14px] rounded-[7px] px-1 text-[9px] font-bold text-white shrink-0"
            style={{ background: "var(--sig-danger)" }}
          >
            {c.unread}
          </span>
        )}
      </div>
    </div>
  );
}
