import type { PolicyLookupViz } from "@/types/api";
import { VizFrame } from "./VizFrame";

// Two stacked policy decision cards (Reg E §1005.11, Internal P-12)
// with TRIGGER + GRANTS rows and a MATCH badge.
export function PolicyDecisionCard({ viz }: { viz: PolicyLookupViz }) {
  return (
    <VizFrame caption={viz.caption} accent="var(--c-policy)" width={460}>
      <div className="flex flex-col gap-2">
        {viz.rows.map((row) => (
          <div
            key={row.code}
            className="rounded-[5px] px-[11px] py-[9px]"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border-subtle)",
              borderLeft: "3px solid var(--c-policy)",
            }}
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="mono text-[10.5px] font-bold tracking-[0.4px]"
                style={{ color: "var(--c-policy)" }}
              >
                {row.code}
              </span>
              <span className="text-[11.5px] font-semibold text-ink">
                {row.title}
              </span>
              <span
                className="mono text-[9px] font-bold tracking-[0.6px] rounded-[3px] px-[6px] py-px ml-auto"
                style={{
                  color: "var(--sig-ok)",
                  background: "color-mix(in oklab, var(--sig-ok) 12%, white)",
                }}
              >
                ✓ MATCH
              </span>
            </div>
            <div className="mt-[5px] grid grid-cols-[64px_1fr] gap-[6px] text-[11px] text-ink-muted">
              <span
                className="mono text-[9px] tracking-[0.4px] text-ink-subtle"
              >
                TRIGGER
              </span>
              <span className="text-ink">{row.trigger}</span>
              <span
                className="mono text-[9px] tracking-[0.4px] text-ink-subtle"
              >
                GRANTS
              </span>
              <ul className="m-0 p-0 list-none flex flex-col gap-[2px]">
                {row.eligibility.map((e) => (
                  <li key={e} className="text-[11.5px] text-ink">
                    <span
                      className="mr-[5px]"
                      style={{ color: "var(--c-policy)" }}
                    >
                      →
                    </span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </VizFrame>
  );
}
