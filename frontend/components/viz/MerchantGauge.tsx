import type { MerchantGaugeViz } from "@/types/api";
import { VizFrame } from "./VizFrame";

// 90-day chargeback rate bar with p50/p90/p99 reference markers.
// Ported from docs/design/reference-code/agent-viz.jsx (VizMerchantGauge).
export function MerchantGauge({ viz }: { viz: MerchantGaugeViz }) {
  const W = 340;
  const H = 124;
  const PADL = 12;
  const PADR = 16;
  const PADT = 18;
  const innerW = W - PADL - PADR;
  const xScale = (v: number) => PADL + (v / viz.max) * innerW;
  const barY = PADT + 18;
  const barH = 22;
  const merchantW = xScale(viz.merchantRate) - PADL;
  const ticks = [0, 2, 4, 6, 8, 10];

  return (
    <VizFrame caption={viz.caption} accent="var(--sig-danger)">
      <div className="flex justify-between items-baseline mb-[2px]">
        <span className="mono text-[9.5px] font-semibold tracking-[0.5px] text-ink-subtle">
          90D CHARGEBACK RATE
        </span>
        <span className="mono text-[9.5px] text-ink-subtle">
          0–{viz.max}%
        </span>
      </div>
      <svg width={W} height={H} className="block">
        {/* track */}
        <rect
          x={PADL}
          y={barY}
          width={innerW}
          height={barH}
          rx="2"
          fill="var(--bg-2)"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        {/* industry p50→p99 shaded zone */}
        <rect
          x={xScale(viz.industry.p50)}
          y={barY}
          width={xScale(viz.industry.p99) - xScale(viz.industry.p50)}
          height={barH}
          fill="color-mix(in oklab, var(--c-merchant) 14%, transparent)"
        />
        {/* merchant bar */}
        <rect
          x={PADL}
          y={barY}
          width={merchantW}
          height={barH}
          rx="2"
          fill="color-mix(in oklab, var(--sig-danger) 80%, white)"
        />
        <text
          x={PADL + merchantW - 8}
          y={barY + barH / 2 + 4}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="700"
          fill="white"
        >
          {viz.merchantRate}%
        </text>
        {/* reference markers */}
        {(["p50", "p90", "p99"] as const).map((k) => {
          const v = viz.industry[k];
          const x = xScale(v);
          return (
            <g key={k}>
              <line
                x1={x}
                x2={x}
                y1={barY - 4}
                y2={barY + barH + 4}
                stroke="var(--c-merchant)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={barY - 7}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8.5"
                fill="var(--c-merchant)"
                fontWeight="700"
              >
                {k.toUpperCase()}
              </text>
              <text
                x={x}
                y={barY + barH + 14}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8.5"
                fill="var(--text-3)"
              >
                {v}%
              </text>
            </g>
          );
        })}
        {/* baseline ticks */}
        {ticks.map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={H - 4}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--text-4)"
          >
            {t}%
          </text>
        ))}
      </svg>
    </VizFrame>
  );
}
