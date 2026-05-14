"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AgentId, AgentMessage, TimelineEntry } from "@/types/api";
import { AGENT_META } from "@/lib/agents";
import { useCaseStreamStore } from "@/lib/store/case-stream";
import {
  SystemEventLine,
  DateSeparator,
} from "./SystemEventLine";
import { CustomerHistoryMessage } from "@/components/agents/CustomerHistoryMessage";
import { MerchantAnalysisMessage } from "@/components/agents/MerchantAnalysisMessage";
import { NetworkGraphMessage } from "@/components/agents/NetworkGraphMessage";
import { PolicyLookupMessage } from "@/components/agents/PolicyLookupMessage";
import { AnalystMessageBubble } from "@/components/agents/AnalystMessageBubble";
import { TypingIndicator } from "@/components/agents/TypingIndicator";
import { SynthesisCard } from "./SynthesisCard";

type Props = { entries: TimelineEntry[] };

const AGENT_IDS: AgentId[] = ["customer", "merchant", "network", "policy"];

export function CaseConversation({ entries }: Props) {
  const agentStatus = useCaseStreamStore((s) => s.agentStatus);

  // Each agent currently mid-investigation gets a typing indicator
  // pinned to the bottom of the conversation. Order matches AGENT_IDS
  // so the stack is stable as lanes flip in/out of working.
  const workingAgents = useMemo(
    () => AGENT_IDS.filter((id) => agentStatus[id] === "working"),
    [agentStatus],
  );

  // Auto-scroll to bottom whenever new content lands — keeps the live
  // stream visible without the user having to chase it manually.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, workingAgents.length]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-auto bg-bg-0 px-[18px] py-4"
    >
      <DateSeparator label="Today" />
      {entries.map((entry, i) => (
        <TimelineEntryView key={i} entry={entry} />
      ))}
      {workingAgents.map((id) => (
        <TypingIndicator key={id} agent={AGENT_META[id]} />
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
      return <AnalystMessageBubble msg={entry} />;
    case "synthesis":
      return <SynthesisCard result={entry} />;
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
