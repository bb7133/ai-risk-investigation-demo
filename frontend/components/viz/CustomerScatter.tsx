import type { CustomerHistoryViz } from "@/types/api";
import { VizFrame } from "./VizFrame";

// 8-year baseline scatter (hour × log amount) + tonight's outlier.
// Ported from docs/design/reference-code/agent-viz.jsx (VizCustomerScatter).
export function CustomerScatter({ viz }: { viz: CustomerHistoryViz }) {
  const W = 340;
  const H = 158;
  const PADL = 36;
  const PADR = 14;
  const PADT = 12;
  const PADB = 22;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;
  const yMin = 20;
  const yMax = 5000;
  const ly = (v: number) => Math.log10(Math.max(v, yMin));
  const yScale = (v: number) =>
    PADT + innerH - ((ly(v) - ly(yMin)) / (ly(yMax) - ly(yMin))) * innerH;
  const xScale = (h: number) => PADL + (h / 24) * innerW;

  const yTicks = [50, 500, 5000];
  const xTicks = [0, 6, 12, 18, 24];

  return (
    <VizFrame caption={viz.caption} accent="var(--sig-danger)">
      <svg width={W} height={H} className="block">
        {/* y grid */}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={PADL}
              x2={W - PADR}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
            <text
              x={PADL - 6}
              y={yScale(t) + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--text-3)"
            >
              ${t.toLocaleString()}
            </text>
          </g>
        ))}
        {/* x ticks */}
        {xTicks.map((t) => (
          <text
            key={`x${t}`}
            x={xScale(t)}
            y={H - 6}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--text-3)"
          >
            {String(t).padStart(2, "0")}h
          </text>
        ))}
        {/* axis */}
        <line
          x1={PADL}
          x2={W - PADR}
          y1={H - PADB}
          y2={H - PADB}
          stroke="var(--border-base)"
          strokeWidth="1"
        />
        {/* baseline cluster halo */}
        <rect
          x={xScale(9)}
          width={xScale(22) - xScale(9)}
          y={yScale(220)}
          height={yScale(28) - yScale(220)}
          fill="color-mix(in oklab, var(--c-customer) 12%, transparent)"
          stroke="color-mix(in oklab, var(--c-customer) 35%, transparent)"
          strokeDasharray="2 2"
          strokeWidth="1"
          rx="2"
        />
        <text
          x={xScale(15.5)}
          y={yScale(220) - 4}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="8.5"
          fill="var(--c-customer)"
          fontWeight="600"
        >
          baseline cluster
        </text>
        {/* baseline points */}
        {viz.baseline.map(([h, amt], i) => (
          <circle
            key={i}
            cx={xScale(h)}
            cy={yScale(amt)}
            r="1.8"
            fill="var(--c-customer)"
            opacity="0.55"
          />
        ))}
        {/* outlier */}
        <line
          x1={xScale(viz.outlier.x)}
          x2={xScale(viz.outlier.x)}
          y1={yScale(viz.outlier.y) + 4}
          y2={H - PADB}
          stroke="var(--sig-danger)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.6"
        />
        <circle
          cx={xScale(viz.outlier.x)}
          cy={yScale(viz.outlier.y)}
          r="9"
          fill="color-mix(in oklab, var(--sig-danger) 20%, transparent)"
        />
        <circle
          cx={xScale(viz.outlier.x)}
          cy={yScale(viz.outlier.y)}
          r="4.5"
          fill="var(--sig-danger)"
          stroke="white"
          strokeWidth="1.5"
        />
        <text
          x={xScale(viz.outlier.x) + 12}
          y={yScale(viz.outlier.y) - 2}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--sig-danger)"
          fontWeight="700"
        >
          ${viz.outlier.y.toLocaleString()} · 03:14
        </text>
        <text
          x={xScale(viz.outlier.x) + 12}
          y={yScale(viz.outlier.y) + 9}
          fontFamily="var(--font-mono)"
          fontSize="8"
          fill="var(--sig-danger)"
          letterSpacing="0.5"
        >
          6.4σ OUTLIER
        </text>
      </svg>
    </VizFrame>
  );
}
