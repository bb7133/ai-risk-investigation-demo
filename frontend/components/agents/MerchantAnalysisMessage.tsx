import type { MerchantAnalysisMessage as Msg } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { AgentMessageShell } from "./AgentMessageShell";
import { Narrative } from "./Narrative";
import { FindingBox } from "./FindingBox";
import { InspectQuery } from "./InspectQuery";
import { MerchantGauge } from "@/components/viz/MerchantGauge";

export function MerchantAnalysisMessage({ msg }: { msg: Msg }) {
  return (
    <AgentMessageShell agent={AGENT_META.merchant} ts={msg.ts}>
      <Narrative text={msg.narrative} mention={msg.mention} />
      {msg.viz && <MerchantGauge viz={msg.viz} />}
      {msg.finding && <FindingBox text={msg.finding} />}
      {msg.inspect && <InspectQuery items={msg.inspect} agent="merchant" />}
    </AgentMessageShell>
  );
}
