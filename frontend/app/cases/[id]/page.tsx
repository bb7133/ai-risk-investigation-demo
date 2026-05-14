"use client";

import { use, useEffect, useState } from "react";
import type { Case, TimelineEntry } from "@/types/api";
import { listCases, getCase, getCaseTimeline } from "@/lib/api/cases";
import { useCasesStore } from "@/lib/store/cases";
import { AppShell } from "@/components/layout/AppShell";
import { RightPanel } from "@/components/layout/RightPanel";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseConversation } from "@/components/case/CaseConversation";
import { LiveStatusLine } from "@/components/case/LiveStatusLine";
import { QuickActionChips } from "@/components/case/QuickActionChips";
import { MessageInput } from "@/components/case/MessageInput";

type Props = { params: Promise<{ id: string }> };

type CasePageData = {
  caseDetail: Case;
  timeline: TimelineEntry[];
};

export default function CasePage({ params }: Props) {
  const { id } = use(params);
  const [data, setData] = useState<CasePageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the cases sidebar store once per session. Subsequent
  // navigations skip this and only refetch the per-case data.
  useEffect(() => {
    if (useCasesStore.getState().hydrated) return;
    listCases().then((cases) => useCasesStore.getState().hydrate(cases));
  }, []);

  // Per-case data refetches on id change.
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    Promise.all([getCase(id), getCaseTimeline(id)])
      .then(([caseDetail, timeline]) => {
        if (cancelled) return;
        setData({ caseDetail, timeline });
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

  return (
    <AppShell
      activeCaseId={id}
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
