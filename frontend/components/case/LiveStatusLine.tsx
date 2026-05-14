"use client";

import type { AgentId } from "@/types/api";
import { AGENT_META, type AgentMeta } from "@/lib/agents";
import { useCaseStreamStore } from "@/lib/store/case-stream";

// Slack-style chat footer that sits between the conversation and the
// chips/input. When any agent is in "working" state, shows their
// presence dots + an aggregated "X is investigating" line + the three
// bouncing dots. When the stream finishes, swaps to a quiet
// "investigation complete" status.

const AGENT_IDS: AgentId[] = ["customer", "merchant", "network", "policy"];

export function LiveStatusLine() {
  const agentStatus = useCaseStreamStore((s) => s.agentStatus);
  const phase = useCaseStreamStore((s) => s.phase);

  const working = AGENT_IDS
    .filter((id) => agentStatus[id] === "working")
    .map((id) => AGENT_META[id]);

  if (working.length === 0) {
    return (
      <div className="flex items-center gap-2 px-[18px] py-[6px] text-[11px] text-ink-subtle h-[28px]">
        {phase === "done" ? (
          <>
            <span style={{ color: "var(--sig-ok)" }}>✓</span>
            <span>Investigation complete · all agents have reported.</span>
          </>
        ) : phase === "error" ? (
          <span>Connection error</span>
        ) : (
          <span>Connecting to case stream…</span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-[18px] py-[6px] text-[11px] h-[28px]"
      style={{ color: "var(--text-3)" }}
    >
      <span className="flex items-end gap-[2px] mb-px" aria-hidden>
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: "180ms" }} />
        <span className="typing-dot" style={{ animationDelay: "360ms" }} />
      </span>
      <span>{typingLabel(working)}</span>
    </div>
  );
}

function typingLabel(agents: AgentMeta[]): string {
  if (agents.length === 1) return `${agents[0].name} is investigating`;
  if (agents.length === 2) {
    return `${agents[0].name} and ${agents[1].name} are investigating`;
  }
  if (agents.length === 3) {
    return `${agents[0].name}, ${agents[1].name}, and ${agents[2].name} are investigating`;
  }
  return `${agents.length} agents are investigating`;
}
