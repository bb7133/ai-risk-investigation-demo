import { apiFetch } from "./client";
import type {
  Case,
  CaseEvent,
  CaseListItem,
  SynthesisResolvedMeta,
  TimelineEntry,
} from "@/types/api";

export function listCases(): Promise<CaseListItem[]> {
  return apiFetch<CaseListItem[]>("/api/cases");
}

export function getCase(id: string): Promise<Case> {
  return apiFetch<Case>(`/api/cases/${encodeURIComponent(id)}`);
}

export function getCaseTimeline(id: string): Promise<TimelineEntry[]> {
  return apiFetch<TimelineEntry[]>(`/api/cases/${encodeURIComponent(id)}/timeline`);
}

export function createCase(): Promise<Case> {
  return apiFetch<Case>("/api/cases", { method: "POST" });
}

// Mark a case resolved server-side. Returns the dispute metadata that
// the synthesis card uses to render the RESOLVED strip.
export function executeCase(id: string): Promise<SynthesisResolvedMeta> {
  return apiFetch<SynthesisResolvedMeta>(
    `/api/cases/${encodeURIComponent(id)}/execute`,
    { method: "POST" },
  );
}

export function sendCaseMessage(id: string, message: string): Promise<CaseEvent[]> {
  return apiFetch<CaseEvent[]>(`/api/cases/${encodeURIComponent(id)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
