import type { CustomerHistoryMessage as Msg } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { AgentMessageShell } from "./AgentMessageShell";
import { Narrative } from "./Narrative";
import { FindingBox } from "./FindingBox";
import { InspectQuery } from "./InspectQuery";
import { CustomerScatter } from "@/components/viz/CustomerScatter";

export function CustomerHistoryMessage({ msg }: { msg: Msg }) {
  return (
    <AgentMessageShell agent={AGENT_META.customer} ts={msg.ts}>
      <Narrative text={msg.narrative} mention={msg.mention} />
      {msg.viz && <CustomerScatter viz={msg.viz} />}
      {msg.finding && <FindingBox text={msg.finding} />}
      {msg.inspect && <InspectQuery items={msg.inspect} agent="customer" />}
    </AgentMessageShell>
  );
}
