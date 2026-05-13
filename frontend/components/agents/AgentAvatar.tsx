import type { AgentMeta } from "@/lib/agents";

export function AgentAvatar({ agent, size = 32 }: { agent: AgentMeta; size?: number }) {
  return (
    <span
      className="mono flex items-center justify-center rounded-full font-bold select-none"
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklab, ${agent.color} 18%, white)`,
        color: agent.color,
        border: `1px solid color-mix(in oklab, ${agent.color} 35%, transparent)`,
        fontSize: Math.round(size * 0.42),
      }}
      aria-hidden
    >
      {agent.glyph}
    </span>
  );
}
