import type { AgentMeta } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";

// Chat-app style typing indicator. Rendered at the bottom of the
// conversation for each agent whose lane is currently in "working"
// status — disappears as soon as that agent goes "done".
export function TypingIndicator({ agent }: { agent: AgentMeta }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3 py-[6px] pb-2">
      <AgentAvatar agent={agent} />
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[12.5px] font-medium text-ink-muted">
          {agent.name}
        </span>
        <span
          className="inline-flex items-center gap-[8px] py-[5px] px-[10px] rounded-full"
          style={{
            background: `color-mix(in oklab, ${agent.color} 6%, white)`,
            border: `1px solid color-mix(in oklab, ${agent.color} 18%, transparent)`,
            color: agent.color,
          }}
        >
          <span className="text-[10.5px] text-ink-subtle">investigating</span>
          <span className="flex items-end gap-[3px] mb-px" aria-hidden>
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "180ms" }} />
            <span className="typing-dot" style={{ animationDelay: "360ms" }} />
          </span>
        </span>
      </div>
    </div>
  );
}
