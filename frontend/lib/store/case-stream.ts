"use client";

import { create } from "zustand";
import type {
  AgentId,
  AgentLaneStatus,
  Case,
  CaseEvent,
  TimelineEntry,
} from "@/types/api";

// The active case as built up from the SSE event stream.
// start(caseId) resets to empty + streaming phase before a new
// subscription opens; apply(event) folds one event in; finish/fail
// flip the terminal phase.

export type StreamPhase = "idle" | "streaming" | "done" | "error";

const INITIAL_STATUS: Record<AgentId, AgentLaneStatus> = {
  customer: "idle",
  merchant: "idle",
  network: "idle",
  policy: "idle",
};

type CaseStreamState = {
  caseId: string | null;
  caseDetail: Case | null;
  timeline: TimelineEntry[];
  agentStatus: Record<AgentId, AgentLaneStatus>;
  phase: StreamPhase;
  error: string | null;
  start: (caseId: string) => void;
  apply: (event: CaseEvent) => void;
  finish: () => void;
  fail: (message: string) => void;
};

export const useCaseStreamStore = create<CaseStreamState>((set) => ({
  caseId: null,
  caseDetail: null,
  timeline: [],
  agentStatus: INITIAL_STATUS,
  phase: "idle",
  error: null,

  start: (caseId) =>
    set({
      caseId,
      caseDetail: null,
      timeline: [],
      agentStatus: INITIAL_STATUS,
      phase: "streaming",
      error: null,
    }),

  apply: (event) =>
    set((s) => {
      switch (event.type) {
        case "case_meta":
          return { caseDetail: event.case };
        case "system_event":
          return { timeline: [...s.timeline, event.entry] };
        case "agent_status":
          return {
            agentStatus: { ...s.agentStatus, [event.agent]: event.status },
          };
        case "agent_message":
          return { timeline: [...s.timeline, event.entry] };
        case "analyst_message":
          return { timeline: [...s.timeline, event.entry] };
        case "synthesis_ready":
          return { timeline: [...s.timeline, event.entry] };
        case "case_resolved":
          return {
            timeline: s.timeline.map((entry) =>
              entry.type === "synthesis"
                ? { ...entry, resolved: event.resolved }
                : entry,
            ),
          };
      }
    }),

  finish: () => set({ phase: "done" }),
  fail: (message) => set({ phase: "error", error: message }),
}));
