"use client";

import { use, useEffect } from "react";
import { listCases } from "@/lib/api/cases";
import { useCasesStore } from "@/lib/store/cases";
import { useCaseStreamStore } from "@/lib/store/case-stream";
import { useCaseEvents } from "@/lib/hooks/use-case-events";
import { AppShell } from "@/components/layout/AppShell";
import { RightPanel } from "@/components/layout/RightPanel";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseConversation } from "@/components/case/CaseConversation";
import { LiveStatusLine } from "@/components/case/LiveStatusLine";
import { QuickActionChips } from "@/components/case/QuickActionChips";
import { MessageInput } from "@/components/case/MessageInput";

type Props = { params: Promise<{ id: string }> };

export default function CasePage({ params }: Props) {
  const { id } = use(params);

  // Hydrate the sidebar store once per session.
  useEffect(() => {
    if (useCasesStore.getState().hydrated) return;
    listCases().then((cases) => useCasesStore.getState().hydrate(cases));
  }, []);

  // Subscribe to the SSE event stream — this drives caseDetail,
  // timeline, and agent-lane status all from one source.
  useCaseEvents(id);

  const caseDetail = useCaseStreamStore((s) => s.caseDetail);
  const timeline = useCaseStreamStore((s) => s.timeline);
  const phase = useCaseStreamStore((s) => s.phase);
  const error = useCaseStreamStore((s) => s.error);

  if (phase === "error") {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-[12px] text-ink-subtle">
        Failed to load case: {error}
      </div>
    );
  }

  // The first event on every stream is case_meta — until it arrives we
  // have no header data to render the shell with.
  if (!caseDetail) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-[12px] text-ink-subtle">
        Connecting to case stream…
      </div>
    );
  }

  return (
    <AppShell
      activeCaseId={id}
      rightPanel={<RightPanel caseDetail={caseDetail} />}
    >
      <CaseHeader caseDetail={caseDetail} />
      <CaseConversation entries={timeline} />
      <LiveStatusLine />
      <QuickActionChips />
      <MessageInput caseId={id} />
    </AppShell>
  );
}
