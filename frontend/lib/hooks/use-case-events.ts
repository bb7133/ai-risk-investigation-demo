"use client";

import { useEffect } from "react";
import type { CaseEvent } from "@/types/api";
import { useCaseStreamStore } from "@/lib/store/case-stream";

// Opens the SSE stream for a case, parses each "data: …\n\n" frame as
// a CaseEvent, and feeds the events into useCaseStreamStore. Reopens
// on caseId change and aborts the in-flight fetch on unmount.
export function useCaseEvents(caseId: string) {
  const start = useCaseStreamStore((s) => s.start);
  const apply = useCaseStreamStore((s) => s.apply);
  const finish = useCaseStreamStore((s) => s.finish);
  const fail = useCaseStreamStore((s) => s.fail);

  useEffect(() => {
    start(caseId);
    const ctl = new AbortController();

    consume(caseId, apply, ctl.signal).then(
      () => {
        if (!ctl.signal.aborted) finish();
      },
      (err: unknown) => {
        if (ctl.signal.aborted) return;
        fail(err instanceof Error ? err.message : String(err));
      },
    );

    return () => ctl.abort();
  }, [caseId, start, apply, finish, fail]);
}

async function consume(
  caseId: string,
  apply: (event: CaseEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}/events`, {
    signal,
    headers: { Accept: "text/event-stream" },
  });
  if (!res.ok || !res.body) {
    throw new Error(`SSE failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        try {
          apply(JSON.parse(json) as CaseEvent);
        } catch (err) {
          console.warn("[useCaseEvents] dropped malformed frame", json, err);
        }
      }
    }
  }
}
