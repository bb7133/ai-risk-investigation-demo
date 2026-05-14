import type { PolicyLookupMessage as Msg } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { AgentMessageShell } from "./AgentMessageShell";
import { Narrative } from "./Narrative";
import { FindingBox } from "./FindingBox";
import { InspectQuery } from "./InspectQuery";
import { PolicyDecisionCard } from "@/components/viz/PolicyDecisionCard";

export function PolicyLookupMessage({ msg }: { msg: Msg }) {
  return (
    <AgentMessageShell agent={AGENT_META.policy} ts={msg.ts}>
      <Narrative text={msg.narrative} mention={msg.mention} />
      {msg.viz && <PolicyDecisionCard viz={msg.viz} />}
      {msg.finding && <FindingBox text={msg.finding} />}
      {msg.inspect && <InspectQuery items={msg.inspect} agent="policy" />}
    </AgentMessageShell>
  );
}
