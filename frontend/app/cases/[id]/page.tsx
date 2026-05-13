"use client";

import { use, useEffect, useState } from "react";
import type { Case, CaseListItem, TimelineEntry } from "@/types/api";
import { listCases, getCase, getCaseTimeline } from "@/lib/api/cases";
import { AppShell } from "@/components/layout/AppShell";
import { RightPanel } from "@/components/layout/RightPanel";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseConversation } from "@/components/case/CaseConversation";
import { LiveStatusLine } from "@/components/case/LiveStatusLine";
import { QuickActionChips } from "@/components/case/QuickActionChips";
import { MessageInput } from "@/components/case/MessageInput";

type Props = { params: Promise<{ id: string }> };

type CasePageData = {
  cases: CaseListItem[];
  caseDetail: Case;
  timeline: TimelineEntry[];
};

export default function CasePage({ params }: Props) {
  const { id } = use(params);
  const [data, setData] = useState<CasePageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    Promise.all([listCases(), getCase(id), getCaseTimeline(id)])
      .then(([cases, caseDetail, timeline]) => {
        if (cancelled) return;
        setData({ cases, caseDetail, timeline });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-[12px] text-ink-subtle">
        Failed to load case: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-[12px] text-ink-subtle">
        Loading case…
      </div>
    );
  }

  const awaitingCount = data.cases.length;
  const highPriorityUnread = data.cases.reduce((s, c) => s + c.unread, 0);

  return (
    <AppShell
      cases={data.cases}
      activeCaseId={id}
      awaitingCount={awaitingCount}
      highPriorityUnread={highPriorityUnread}
      rightPanel={<RightPanel caseDetail={data.caseDetail} />}
    >
      <CaseHeader caseDetail={data.caseDetail} />
      <CaseConversation entries={data.timeline} />
      <LiveStatusLine text="Network Graph is looking up adjacent clusters…" />
      <QuickActionChips />
      <MessageInput caseId={id} />
    </AppShell>
  );
}
