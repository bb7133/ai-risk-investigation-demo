"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ANALYST_META } from "@/lib/agents";
import { useToastStore } from "@/lib/store/toast";

// Sized to outlast the 8s toast auto-dismiss so the analyst can't
// stack pushes by spamming the button.
const NEW_CASE_COOLDOWN_MS = 10_000;

export function TopBar() {
  const showToast = useToastStore((s) => s.show);
  const [cooling, setCooling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onNewCase = () => {
    if (cooling) return;
    showToast();
    setCooling(true);
    timerRef.current = setTimeout(() => setCooling(false), NEW_CASE_COOLDOWN_MS);
  };

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 w-[244px] shrink-0">
        <div
          className="w-[22px] h-[22px] rounded-[5px]"
          style={{
            background:
              "linear-gradient(135deg, var(--c-customer), var(--c-merchant))",
          }}
          aria-hidden
        />
        <div className="leading-tight">
          <div className="text-[12.5px] font-bold tracking-[0.4px] text-ink">
            CLAiMS
          </div>
          <div className="mono text-[9px] text-ink-subtle tracking-[0.6px] -mt-px">
            fraud + dispute ops
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 w-1/2 max-w-[460px] rounded-md border border-line-subtle bg-surface-muted px-3 py-[5px]">
          <Search className="h-[13px] w-[13px] text-ink-subtle" strokeWidth={1.6} />
          <span className="flex-1 text-[12px] text-ink-subtle">
            Search cases, customers, merchants…
          </span>
          <span className="mono text-[10px] text-ink-faint border border-line-subtle rounded-[3px] px-[5px] py-px">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={onNewCase}
          disabled={cooling}
          className="rounded-[5px] border border-line bg-transparent px-[10px] py-[5px] text-[11.5px] text-ink-muted hover:bg-surface-muted cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
          New case
        </button>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mono"
          style={{
            background: `color-mix(in oklab, ${ANALYST_META.color} 18%, white)`,
            color: ANALYST_META.color,
            border: `1px solid color-mix(in oklab, ${ANALYST_META.color} 35%, transparent)`,
          }}
          aria-label={ANALYST_META.name}
        >
          {ANALYST_META.initials}
        </div>
        <div className="leading-[1.1]">
          <div className="text-[11.5px] font-medium text-ink">
            {ANALYST_META.name}
          </div>
          <div className="text-[9.5px] text-ink-subtle">
            {ANALYST_META.role}
          </div>
        </div>
      </div>
    </header>
  );
}
