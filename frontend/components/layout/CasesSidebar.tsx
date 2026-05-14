"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { CaseListItem } from "@/types/api";
import { useCasesStore } from "@/lib/store/cases";

type SectionKey = "awaiting" | "investigating" | "resolved" | "all";

type Section = {
  v: SectionKey;
  label: string;
  sub: string;
  match: (c: CaseListItem) => boolean;
};

const SECTIONS: Section[] = [
  {
    v: "awaiting",
    label: "Awaiting my review",
    sub: "High priority",
    match: (c) => c.status === "awaiting" && c.priority === "high",
  },
  {
    v: "investigating",
    label: "Investigating",
    sub: "In progress",
    match: (c) => c.status === "investigating",
  },
  {
    v: "resolved",
    label: "Resolved by me",
    sub: "Today",
    match: (c) => c.status === "resolved",
  },
  {
    v: "all",
    label: "All cases",
    sub: "Everything in the queue",
    match: () => true,
  },
];

type Props = { activeCaseId: string };

export function CasesSidebar({ activeCaseId }: Props) {
  const cases = useCasesStore((s) => s.cases);
  const [section, setSection] = useState<SectionKey>("awaiting");

  const counts = useMemo(() => {
    const c: Record<SectionKey, number> = {
      awaiting: 0,
      investigating: 0,
      resolved: 0,
      all: 0,
    };
    for (const s of SECTIONS) {
      c[s.v] = cases.filter(s.match).length;
    }
    return c;
  }, [cases]);

  const unreads = useMemo(() => {
    const u: Record<SectionKey, number> = {
      awaiting: 0,
      investigating: 0,
      resolved: 0,
      all: 0,
    };
    for (const s of SECTIONS) {
      u[s.v] = cases.filter(s.match).reduce((acc, c) => acc + c.unread, 0);
    }
    return u;
  }, [cases]);

  const active = SECTIONS.find((s) => s.v === section) ?? SECTIONS[0];
  const items = useMemo(() => cases.filter(active.match), [cases, active]);

  return (
    <aside className="w-[264px] shrink-0 bg-surface border-r border-line flex flex-col min-h-0">
      <div className="px-[14px] pt-3 pb-[6px]">
        <span className="mono text-[10px] font-bold tracking-[0.8px] text-ink-subtle">
          CASES
        </span>
      </div>

      <FilterDropdown
        active={active}
        counts={counts}
        unreads={unreads}
        onSelect={setSection}
      />

      <div className="flex-1 overflow-auto pb-[6px]">
        {items.length === 0 ? (
          <div className="px-[14px] py-6 text-center text-[11.5px] text-ink-subtle">
            Nothing here right now.
          </div>
        ) : (
          items.map((c) => (
            <CaseRow key={c.id} c={c} active={c.id === activeCaseId} />
          ))
        )}
      </div>
    </aside>
  );
}

function FilterDropdown({
  active,
  counts,
  unreads,
  onSelect,
}: {
  active: Section;
  counts: Record<SectionKey, number>;
  unreads: Record<SectionKey, number>;
  onSelect: (v: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative px-[10px] pb-[10px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full grid grid-cols-[1fr_auto_14px] items-center gap-2 rounded-md px-[10px] py-2 text-left cursor-pointer"
        style={{
          background: open ? "var(--bg-2)" : "var(--bg-1)",
          border: `1px solid ${open ? "var(--border-strong)" : "var(--border-base)"}`,
        }}
      >
        <span className="min-w-0">
          <span className="block text-[12.5px] font-semibold text-ink truncate">
            {active.label}
          </span>
          <span className="mono block text-[10.5px] text-ink-subtle tracking-[0.2px] mt-px truncate">
            {active.sub}
          </span>
        </span>
        <span className="inline-flex items-center gap-1">
          <CountBadge label={String(counts[active.v])} />
          {unreads[active.v] > 0 && (
            <CountBadge label={String(unreads[active.v])} danger />
          )}
        </span>
        <ChevronDown
          className="h-[11px] w-[11px] text-ink-subtle transition-transform duration-150"
          strokeWidth={1.6}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-[10px] right-[10px] mt-1 z-20 rounded-md p-1"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border-base)",
            boxShadow: "var(--shadow-2)",
          }}
        >
          {SECTIONS.map((s, i) => (
            <div key={s.v}>
              {s.v === "all" && (
                <div className="h-px bg-line-subtle mx-[6px] my-1" />
              )}
              <button
                type="button"
                onClick={() => {
                  onSelect(s.v);
                  setOpen(false);
                }}
                className="w-full grid grid-cols-[1fr_auto] items-center gap-2 rounded px-2 py-[6px] text-left cursor-pointer"
                style={{
                  background: active.v === s.v ? "var(--bg-2)" : "transparent",
                }}
              >
                <span className="min-w-0">
                  <span
                    className="block text-[12px]"
                    style={{
                      fontWeight: active.v === s.v ? 600 : 500,
                      color:
                        active.v === s.v ? "var(--text-1)" : "var(--text-2)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span className="mono block text-[10px] text-ink-subtle tracking-[0.2px] mt-px">
                    {s.sub}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <CountBadge label={String(counts[s.v])} small />
                  {unreads[s.v] > 0 && (
                    <CountBadge label={String(unreads[s.v])} small danger />
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CountBadge({
  label,
  small,
  danger,
}: {
  label: string;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <span
      className="mono inline-flex items-center justify-center font-bold text-center"
      style={{
        minWidth: small ? 20 : 22,
        height: small ? 15 : 17,
        padding: small ? "0 6px" : "0 7px",
        borderRadius: 10,
        background: danger ? "var(--sig-danger)" : "var(--bg-3)",
        color: danger ? "white" : "var(--text-2)",
        fontSize: small ? 9.5 : 10,
        lineHeight: small ? "15px" : "17px",
      }}
    >
      {label}
    </span>
  );
}

function CaseRow({ c, active }: { c: CaseListItem; active: boolean }) {
  const router = useRouter();
  const markRead = useCasesStore((s) => s.markRead);

  function onClick() {
    markRead(c.id);
    router.push(`/cases/${c.id}`);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-[7px] flex flex-col gap-[3px] text-left cursor-pointer"
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
    </button>
  );
}
