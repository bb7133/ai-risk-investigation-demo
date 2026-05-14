"use client";

import { useEffect, useRef } from "react";
import type { AgentMessage, TimelineEntry } from "@/types/api";
import {
  SystemEventLine,
  DateSeparator,
} from "./SystemEventLine";
import { CustomerHistoryMessage } from "@/components/agents/CustomerHistoryMessage";
import { MerchantAnalysisMessage } from "@/components/agents/MerchantAnalysisMessage";
import { NetworkGraphMessage } from "@/components/agents/NetworkGraphMessage";
import { PolicyLookupMessage } from "@/components/agents/PolicyLookupMessage";
import { AnalystMessageBubble } from "@/components/agents/AnalystMessageBubble";
import { SynthesisCard } from "./SynthesisCard";

type Props = { entries: TimelineEntry[] };

export function CaseConversation({ entries }: Props) {
  // Auto-anchor to the bottom whenever new entries land — messenger
  // pattern. requestAnimationFrame defers the scroll until after the
  // newly rendered entry has actually contributed to scrollHeight.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [entries.length]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-auto bg-bg-0 px-[18px] py-4"
    >
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
