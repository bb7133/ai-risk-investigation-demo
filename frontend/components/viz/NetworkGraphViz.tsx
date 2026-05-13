import type { NetworkGraphViz as NetworkVizData, NetworkNode } from "@/types/api";
import { VizFrame } from "./VizFrame";

// RING-142 cluster preview — receiver at center, 6 settlements
// inner ring (3 mules), 40 outer nodes (18 victims).
// Pre-computed positions render straight to SVG; react-force-graph-2d
// is in deps for future runtime force layout.
export function NetworkGraphViz({ viz }: { viz: NetworkVizData }) {
  const W = 340;
  const H = 200;
  const cx = (x: number) => x + 10;
  const cy = (y: number) => y + 10;

  const nodeMap: Record<string, NetworkNode> = Object.fromEntries(
    viz.nodes.map((n) => [n.id, n]),
  );

  return (
    <VizFrame caption={viz.caption} accent="var(--c-network)">
      <div className="relative">
        <svg width={W} height={H} className="block">
          {/* cluster halo */}
          <ellipse
            cx={170}
            cy={100}
            rx="138"
            ry="88"
            fill="color-mix(in oklab, var(--c-network) 5%, transparent)"
            stroke="color-mix(in oklab, var(--c-network) 22%, transparent)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {/* edges */}
          {viz.edges.map((e, i) => {
            const A = nodeMap[e.a];
            const B = nodeMap[e.b];
            if (!A || !B) return null;
            return (
              <line
                key={i}
                x1={cx(A.x)}
                y1={cy(A.y)}
                x2={cx(B.x)}
                y2={cy(B.y)}
                stroke={e.mule ? "var(--sig-warn)" : "var(--border-strong)"}
                strokeWidth={e.mule ? 1.2 : 0.6}
                strokeDasharray={e.mule ? "2 2" : undefined}
                opacity={e.mule ? 0.85 : 0.55}
              />
            );
          })}
          {/* nodes */}
          {viz.nodes.map((n) => (
            <g key={n.id}>
              {n.kind === "receiver" && (
                <circle
                  cx={cx(n.x)}
                  cy={cy(n.y)}
                  r="14"
                  fill="color-mix(in oklab, var(--sig-danger) 18%, transparent)"
                />
              )}
              <circle
                cx={cx(n.x)}
                cy={cy(n.y)}
                r={n.r}
                fill={nodeColor(n.kind)}
                stroke={n.kind === "receiver" ? "white" : "none"}
                strokeWidth={n.kind === "receiver" ? 1.5 : 0}
              />
            </g>
          ))}
          {/* receiver label */}
          <line
            x1={cx(160)}
            y1={cy(90) - 16}
            x2={cx(160)}
            y2={cy(90) - 32}
            stroke="var(--sig-danger)"
            strokeWidth="1"
          />
          <rect x={130} y={cy(90) - 50} width="80" height="16" rx="3" fill="var(--sig-danger)" />
          <text
            x={170}
            y={cy(90) - 39}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="white"
            fontWeight="700"
            letterSpacing="0.5"
          >
            acq_A91F
          </text>
          {/* RING badge */}
          <g transform="translate(12, 12)">
            <rect width="68" height="18" rx="3" fill="var(--bg-1)" stroke="var(--border-base)" />
            <text
              x="34"
              y="12"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fontWeight="700"
              fill="var(--c-network)"
              letterSpacing="0.5"
            >
              RING-142
            </text>
          </g>
          {/* confidence */}
          <g transform={`translate(${W - 78}, 12)`}>
            <rect width="66" height="18" rx="3" fill="var(--bg-1)" stroke="var(--border-base)" />
            <text
              x="33"
              y="12"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fontWeight="700"
              fill="var(--text-1)"
            >
              conf 0.91
            </text>
          </g>
        </svg>
        {/* legend */}
        <div className="absolute bottom-[6px] left-[10px] right-[10px] flex flex-wrap gap-3 mono text-[9px] text-ink-subtle tracking-[0.3px]">
          <LegendDot color="var(--sig-danger)" label="receiver" />
          <LegendDot color="var(--c-network)" label="prior victim · 18" />
          <LegendDot color="var(--sig-warn)" label="mule edge" dashed />
          <LegendDot color="var(--text-2)" label="settlement" />
        </div>
      </div>
    </VizFrame>
  );
}

function nodeColor(kind: NetworkNode["kind"]): string {
  switch (kind) {
    case "receiver":
      return "var(--sig-danger)";
    case "victim":
      return "var(--c-network)";
    case "mule":
      return "var(--sig-warn)";
    case "settle":
      return "var(--text-2)";
    default:
      return "var(--text-3)";
  }
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {dashed ? (
        <span
          className="w-3 h-0"
          style={{ borderTop: `1.5px dashed ${color}` }}
        />
      ) : (
        <span
          className="w-[7px] h-[7px] rounded-[4px]"
          style={{ background: color }}
        />
      )}
      <span>{label}</span>
    </span>
  );
}
