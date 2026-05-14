import type { NetworkGraphMessage as Msg } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { AgentMessageShell } from "./AgentMessageShell";
import { Narrative } from "./Narrative";
import { FindingBox } from "./FindingBox";
import { InspectQuery } from "./InspectQuery";
import { NetworkGraphViz } from "@/components/viz/NetworkGraphViz";

// Used for both the initial network analysis and Network's reply to
// Maya. The follow-up reply omits viz/finding/inspect.
export function NetworkGraphMessage({ msg }: { msg: Msg }) {
  return (
    <AgentMessageShell agent={AGENT_META.network} ts={msg.ts}>
      <Narrative text={msg.narrative} mention={msg.mention} />
      {msg.viz && <NetworkGraphViz viz={msg.viz} />}
      {msg.finding && <FindingBox text={msg.finding} />}
      {msg.inspect && <InspectQuery items={msg.inspect} agent="network" />}
    </AgentMessageShell>
  );
}
