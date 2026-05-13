import type { AgentMessage, TimelineEntry } from "@/types/api";
import {
  SystemEventLine,
  DateSeparator,
} from "./SystemEventLine";
import { CustomerHistoryMessage } from "@/components/agents/CustomerHistoryMessage";
import { MerchantAnalysisMessage } from "@/components/agents/MerchantAnalysisMessage";
import { NetworkGraphMessage } from "@/components/agents/NetworkGraphMessage";
import { PolicyLookupMessage } from "@/components/agents/PolicyLookupMessage";

type Props = { entries: TimelineEntry[] };

export function CaseConversation({ entries }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-bg-0 px-[18px] py-4">
      <DateSeparator label="Today" />
      {entries.map((entry, i) => (
        <TimelineEntryView key={i} entry={entry} />
      ))}
    </div>
  );
}

function TimelineEntryView({ entry }: { entry: TimelineEntry }) {
  switch (entry.type) {
    case "system":
      return <SystemEventLine event={entry} />;
    case "agent":
      return <AgentDispatch msg={entry} />;
    case "analyst":
    case "synthesis":
      // Replaced by dedicated components in commit 8.
      return (
        <div className="my-2 text-[10.5px] mono text-ink-faint">
          [{entry.type} · {entry.ts}]
        </div>
      );
  }
}

function AgentDispatch({ msg }: { msg: AgentMessage }) {
  switch (msg.agent) {
    case "customer":
      return <CustomerHistoryMessage msg={msg} />;
    case "merchant":
      return <MerchantAnalysisMessage msg={msg} />;
    case "network":
      return <NetworkGraphMessage msg={msg} />;
    case "policy":
      return <PolicyLookupMessage msg={msg} />;
  }
}
