import type { ReactNode } from "react";
import type { AgentMeta } from "@/lib/agents";
import { AgentAvatar } from "./AgentAvatar";

type Props = {
  agent: AgentMeta;
  ts: string;
  children: ReactNode;
};

// Common skeleton for all four agent messages: avatar column on the
// left, content column on the right with the name + AGENT badge + ts
// header, then children stacked vertically (narrative, viz, finding,
// inspect — order set by each agent's message component).
export function AgentMessageShell({ agent, ts, children }: Props) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3 py-[6px] pb-3">
      <AgentAvatar agent={agent} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink">{agent.name}</span>
          <span
            className="mono text-[9px] font-semibold tracking-[0.5px] px-[5px] py-px rounded-[3px]"
            style={{
              color: agent.color,
              background: `color-mix(in oklab, ${agent.color} 10%, white)`,
              border: `1px solid color-mix(in oklab, ${agent.color} 22%, transparent)`,
            }}
          >
            AGENT
          </span>
          <span className="mono text-[10px] text-ink-faint">{ts}</span>
        </div>
        <div className="mt-1 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}
