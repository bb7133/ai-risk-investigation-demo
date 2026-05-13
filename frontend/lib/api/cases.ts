import { apiFetch } from "./client";
import type { Case, CaseListItem, TimelineEntry } from "@/types/api";

export function listCases(): Promise<CaseListItem[]> {
  return apiFetch<CaseListItem[]>("/api/cases");
}

export function getCase(id: string): Promise<Case> {
  return apiFetch<Case>(`/api/cases/${encodeURIComponent(id)}`);
}

export function getCaseTimeline(id: string): Promise<TimelineEntry[]> {
  return apiFetch<TimelineEntry[]>(`/api/cases/${encodeURIComponent(id)}/timeline`);
}
