import type { AgentId } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { Mention } from "./Mention";

// Splits free-form text on @mentions and inlines Mention pills.
// Used for Maya's analyst messages (which may carry @network.history etc.
// anywhere in the body).
export function ParsedText({ text }: { text: string }) {
  const parts = text.split(/(@\w+(?:\.\w+)?)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("@")) {
          const target = p.slice(1).split(".")[0];
          if (target === "maya") return <Mention key={i} target="maya" />;
          if (isAgentId(target)) return <Mention key={i} target={target} />;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function isAgentId(id: string): id is AgentId {
  return id in AGENT_META;
}
