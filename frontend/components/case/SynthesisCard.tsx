"use client";

import { useState } from "react";
import type {
  CitedFile,
  SynthAction,
  SynthesisResolvedMeta,
  SynthesisResult,
  Verdict,
} from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { executeCase } from "@/lib/api/cases";
import { useCaseStreamStore } from "@/lib/store/case-stream";

// System-level recommendation block that sits at the end of the
// conversation. Lands in awaiting state — the analyst clicks Execute,
// which round-trips to MSW, animates each action checkmark, then
// dispatches case_resolved back into the stream store.

type ExecutePhase = "ready" | "executing";

export function SynthesisCard({ result }: { result: SynthesisResult }) {
  const caseId = useCaseStreamStore((s) => s.caseDetail?.id ?? null);
  const apply = useCaseStreamStore((s) => s.apply);

  const [phase, setPhase] = useState<ExecutePhase>("ready");
  const [actionStates, setActionStates] = useState<number[]>(() =>
    result.actions.map(() => 0),
  );

  const isResolved = !!result.resolved;
  const scoreColor =
    result.score >= 80
      ? "var(--sig-danger)"
      : result.score >= 50
        ? "var(--sig-warn)"
        : "var(--sig-ok)";
  const statusLabel = isResolved
    ? "✓ RESOLVED"
    : phase === "executing"
      ? "EXECUTING"
      : "AWAITING REVIEW";
  const statusColor = isResolved
    ? "var(--sig-ok)"
    : phase === "executing"
      ? "var(--sig-active)"
      : "var(--sig-warn)";
  const leftEdge = isResolved
    ? "var(--sig-ok)"
    : "color-mix(in oklab, var(--sig-danger) 70%, white)";

  // Display state for each action checkbox.
  //   resolved → all filled (2)
  //   executing or ready → reflect actionStates from the animation
  const stateFor = (i: number): 0 | 1 | 2 =>
    isResolved ? 2 : ((actionStates[i] ?? 0) as 0 | 1 | 2);

  const onExecute = async () => {
    if (phase !== "ready" || !caseId || isResolved) return;
    setPhase("executing");
    try {
      const [meta] = await Promise.all([
        executeCase(caseId),
        animateActions(result.actions.length, setActionStates),
      ]);
      apply({ type: "case_resolved", resolved: meta });
    } catch (err) {
      console.error("[SynthesisCard] execute failed", err);
      setActionStates(result.actions.map(() => 0));
      setPhase("ready");
    }
  };

  return (
    <div
      className="grid grid-cols-[40px_1fr] gap-3 pt-[14px] pb-3 mt-[6px]"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Σ glyph in place of an agent avatar */}
      <div
        className="mono w-8 h-8 rounded-md flex items-center justify-center text-[16px] font-semibold tracking-[-0.5px]"
        style={{
          background: "var(--bg-2)",
          border: "1px dashed var(--border-strong)",
          color: "var(--text-2)",
        }}
        aria-hidden
      >
        Σ
      </div>

      <div className="min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink">Synthesis</span>
          <span
            className="mono text-[9px] font-bold tracking-[0.6px] text-ink-muted px-[6px] py-px rounded-[3px]"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-base)",
            }}
          >
            SYSTEM
          </span>
          <span className="text-[11px] text-ink-subtle">
            matched policy against mem9 facts
          </span>
          <span className="mono text-[10px] text-ink-faint ml-auto">
            {result.ts}
          </span>
        </div>

        {/* Card */}
        <div
          className="mt-2 rounded-lg overflow-hidden max-w-[620px]"
          style={{
            background: "var(--bg-1)",
            border: "1.5px solid var(--border-strong)",
            borderLeft: `4px solid ${leftEdge}`,
            boxShadow: "var(--shadow-1)",
          }}
        >
          {/* Score + verdicts strip */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "124px 1fr",
              background: "color-mix(in oklab, var(--sig-danger) 4%, white)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <ScoreBlock
              score={result.score}
              confidence={result.confidence}
              color={scoreColor}
            />
            <div
              className="grid grid-cols-4 gap-2 px-[14px] py-3"
              style={{ borderLeft: "1px solid var(--border-subtle)" }}
            >
              {result.verdicts.map((v) => (
                <VerdictPill key={v.agent} v={v} />
              ))}
            </div>
          </div>

          {/* Narrative + file pill */}
          <div
            className="px-[14px] pt-3 pb-[10px]"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <Label>RECOMMENDED ACTION</Label>
            <div className="mt-[6px] text-[12.5px] text-ink leading-[1.55]">
              {result.narrative}
            </div>
            <div className="mt-[9px] flex items-center gap-2">
              <SynthFilePill name={result.file} />
              <span
                className="mono text-[9px] font-bold tracking-[0.6px] ml-auto"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Cited evidence + Actions on execute */}
          <div className="px-[14px] py-3">
            <Label>CITED EVIDENCE</Label>
            <div className="mt-[6px] mb-3 flex flex-wrap gap-[6px]">
              {result.cited.map((c) => (
                <CitedPill key={c.f} cited={c} />
              ))}
            </div>

            <Label>ACTIONS ON EXECUTE</Label>
            <div className="mt-[6px] flex flex-col gap-[5px]">
              {result.actions.map((a, i) => (
                <ActionRow key={i} action={a} state={stateFor(i)} />
              ))}
            </div>

            {/* Execute CTA — visible until the case is resolved. */}
            {!isResolved && (
              <div className="mt-[14px] flex items-center gap-2">
                {phase === "ready" ? (
                  <button
                    type="button"
                    onClick={onExecute}
                    className="rounded-md px-4 py-2 text-[12px] font-semibold tracking-[-0.1px] cursor-pointer text-white"
                    style={{
                      background: "var(--text-1)",
                      border: "none",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    Execute {result.actions.length} actions →
                  </button>
                ) : (
                  <span
                    className="mono text-[11.5px] font-semibold"
                    style={{ color: "var(--sig-active)" }}
                  >
                    Maya Singh approved · executing…
                    <span className="stream-caret" />
                  </span>
                )}
              </div>
            )}
          </div>

          {result.resolved && <ResolvedStrip resolved={result.resolved} />}
        </div>
      </div>
    </div>
  );
}

async function animateActions(
  count: number,
  setStates: React.Dispatch<React.SetStateAction<number[]>>,
): Promise<void> {
  for (let i = 0; i < count; i++) {
    setStates((s) => {
      const n = [...s];
      n[i] = 1;
      return n;
    });
    await sleep(520);
    setStates((s) => {
      const n = [...s];
      n[i] = 2;
      return n;
    });
    await sleep(180);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[9px] font-semibold tracking-[0.7px] text-ink-subtle">
      {children}
    </div>
  );
}

function ScoreBlock({
  score,
  confidence,
  color,
}: {
  score: number;
  confidence: number;
  color: string;
}) {
  return (
    <div
      className="px-[14px] py-3 flex flex-col items-start justify-center"
      style={{ borderRight: "1px solid var(--border-subtle)" }}
    >
      <Label>RISK SCORE</Label>
      <div className="flex items-baseline gap-[2px] mt-1" style={{ color }}>
        <span
          className="mono font-bold leading-none"
          style={{ fontSize: 36, letterSpacing: -1 }}
        >
          {score}
        </span>
        <span className="mono text-[12px] font-medium text-ink-subtle">/100</span>
      </div>
      <div
        className="mt-2 h-[3px] w-[78px] rounded-[2px] overflow-hidden"
        style={{ background: "var(--bg-3)" }}
      >
        <div style={{ width: `${score}%`, height: "100%", background: color }} />
      </div>
      <div className="mt-[6px] text-[10.5px] text-ink-subtle">
        <b className="text-ink font-semibold">{Math.round(confidence * 100)}%</b>{" "}
        confidence
      </div>
    </div>
  );
}

function VerdictPill({ v }: { v: Verdict }) {
  const a = AGENT_META[v.agent];
  const toneColor =
    v.tone === "danger"
      ? "var(--sig-danger)"
      : v.tone === "warn"
        ? "var(--sig-warn)"
        : "var(--sig-ok)";
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-[5px] text-[10.5px] text-ink-subtle">
        <span
          className="mono w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0"
          style={{
            background: `color-mix(in oklab, ${a.color} 20%, white)`,
            color: a.color,
          }}
        >
          {a.glyph}
        </span>
        <span className="truncate">{v.label}</span>
      </div>
      <div
        className="flex items-center gap-[6px] px-[7px] py-[3px] rounded-[4px]"
        style={{
          background: `color-mix(in oklab, ${toneColor} 10%, white)`,
          border: `1px solid color-mix(in oklab, ${toneColor} 25%, transparent)`,
        }}
      >
        <span
          className="mono text-[10px] font-bold tracking-[0.4px]"
          style={{ color: toneColor }}
        >
          {v.level}
        </span>
      </div>
    </div>
  );
}

function SynthFilePill({ name }: { name: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-[9px] py-[5px] rounded-[5px]"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <span
        className="relative shrink-0"
        style={{
          width: 18,
          height: 22,
          background: "var(--bg-1)",
          border: "1px solid var(--border-strong)",
          borderRadius: 2,
        }}
      >
        <span className="mono absolute bottom-[2px] left-0 right-0 text-center text-[6.5px] font-bold text-ink-muted tracking-[0.3px]">
          MD
        </span>
      </span>
      <span className="mono text-[11px] font-medium text-ink">{name}</span>
      <span className="text-[10px] text-ink-faint">· drive9</span>
    </div>
  );
}

function CitedPill({ cited }: { cited: CitedFile }) {
  const a = AGENT_META[cited.a];
  return (
    <div
      className="inline-flex items-center gap-[5px] rounded-[4px] px-[7px] py-[3px]"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <span
        className="mono w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold"
        style={{
          background: `color-mix(in oklab, ${a.color} 22%, white)`,
          color: a.color,
        }}
      >
        {a.glyph}
      </span>
      <span className="mono text-[10.5px] text-ink">{cited.f}</span>
    </div>
  );
}

function ActionRow({ action, state }: { action: SynthAction; state: 0 | 1 | 2 }) {
  const c =
    state === 2
      ? "var(--sig-ok)"
      : state === 1
        ? "var(--sig-active)"
        : "var(--text-4)";
  return (
    <div className="grid grid-cols-[14px_1fr_auto] gap-2 items-center">
      <span
        className={state === 1 ? "pulse-dot" : ""}
        style={{
          width: 12,
          height: 12,
          borderRadius: 12,
          border: `1.5px solid ${c}`,
          background: state === 2 ? c : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {state === 2 && (
          <svg
            width="7"
            height="7"
            viewBox="0 0 8 8"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
          >
            <path d="M1 4l2 2 4-4" />
          </svg>
        )}
      </span>
      <div>
        <div
          className="text-[12px]"
          style={{
            color: state === 0 ? "var(--text-2)" : "var(--text-1)",
          }}
        >
          {action.t}
        </div>
        <div className="mono text-[10px] text-ink-faint mt-px">{action.d}</div>
      </div>
      <span
        className="mono text-[9.5px] font-bold tracking-[0.5px] min-w-[28px] text-right"
        style={{ color: c }}
      >
        {state === 0 ? "" : state === 1 ? "EXEC" : "OK"}
      </span>
    </div>
  );
}

function ResolvedStrip({ resolved }: { resolved: SynthesisResolvedMeta }) {
  return (
    <div
      className="px-[14px] py-3 flex items-center gap-2"
      style={{
        background: "color-mix(in oklab, var(--sig-ok) 7%, white)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <span
        className="mono text-[11px] font-bold tracking-[0.4px]"
        style={{ color: "var(--sig-ok)" }}
      >
        ✓ RESOLVED · {resolved.dispute_id} opened · pattern saved to mem9
      </span>
    </div>
  );
}
