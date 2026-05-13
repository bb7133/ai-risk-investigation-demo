"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { Case } from "@/types/api";
import { CaseModePanel } from "./CaseModePanel";
import { StackModePanel } from "./StackModePanel";

type Mode = "case" | "stack";

export function RightPanel({ caseDetail }: { caseDetail: Case }) {
  const [mode, setMode] = useState<Mode>("case");

  return (
    <aside
      className="w-[300px] min-w-[300px] shrink-0 bg-surface border-l border-line flex flex-col min-h-0"
    >
      {/* Toggle row: collapse button + Case|Stack pill toggle */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-line-subtle">
        <button
          type="button"
          aria-label="Collapse"
          className="w-[22px] h-[22px] -ml-1 rounded text-ink-subtle hover:text-ink-muted flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="h-[11px] w-[11px]" strokeWidth={1.6} />
        </button>
        <div
          className="inline-flex items-stretch w-full p-[2px] rounded-md gap-0"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <ModeButton active={mode === "case"} onClick={() => setMode("case")}>
            Case
          </ModeButton>
          <ModeButton active={mode === "stack"} onClick={() => setMode("stack")}>
            Stack
          </ModeButton>
        </div>
      </div>

      {mode === "case" ? (
        <CaseModePanel caseDetail={caseDetail} />
      ) : (
        <StackModePanel />
      )}
    </aside>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 inline-flex items-center justify-center rounded text-[11.5px] cursor-pointer px-2 py-[5px]"
      style={{
        background: active ? "var(--bg-1)" : "transparent",
        color: active ? "var(--text-1)" : "var(--text-3)",
        fontWeight: active ? 600 : 500,
        boxShadow: active ? "var(--shadow-1)" : "none",
      }}
    >
      {children}
    </button>
  );
}
