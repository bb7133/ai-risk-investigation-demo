import { AGENT_META, ANALYST_META } from "@/lib/agents";
import type { Mention as MentionTarget } from "@/types/api";

export function Mention({ target }: { target: MentionTarget }) {
  if (target === "maya") {
    return (
      <span
        className="font-semibold text-[12.5px] px-[5px] py-px rounded-[3px]"
        style={{
          background: `color-mix(in oklab, ${ANALYST_META.color} 12%, white)`,
          color: ANALYST_META.color,
        }}
      >
        @maya
      </span>
    );
  }
  const agent = AGENT_META[target];
  return (
    <span
      className="font-semibold text-[12.5px] px-[5px] py-px rounded-[3px]"
      style={{
        background: `color-mix(in oklab, ${agent.color} 12%, white)`,
        color: agent.color,
      }}
    >
      @{agent.id}.history
    </span>
  );
}
