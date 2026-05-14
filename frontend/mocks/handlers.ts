import { http, HttpResponse } from "msw";

import { CASES } from "./data/cases";
import { SARAH_CHEN } from "./data/sarah-chen";
import { TIMELINE_SARAH_CHEN } from "./data/sarah-chen-timeline";
import { caseStub, timelineStub } from "./data/case-stub";
import { scenarioFor } from "./data/scenarios";
import { scenarioToSSE } from "./sse";

// Phase 1: Sarah Chen (CASE-2461) has a full timeline. Every other case
// in the sidebar returns a thin stub so navigation does not 404 and the
// "click to read" flow still feels coherent.

function detailFor(id: string) {
  if (id === SARAH_CHEN.id) return SARAH_CHEN;
  const item = CASES.find((c) => c.id === id);
  return item ? caseStub(item) : null;
}

export const handlers = [
  http.get("/api/cases", () => HttpResponse.json(CASES)),

  http.get("/api/cases/:id", ({ params }) => {
    const detail = detailFor(String(params.id));
    if (detail) return HttpResponse.json(detail);
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  http.get("/api/cases/:id/timeline", ({ params }) => {
    if (params.id === SARAH_CHEN.id) return HttpResponse.json(TIMELINE_SARAH_CHEN);
    const item = CASES.find((c) => c.id === params.id);
    if (item) return HttpResponse.json(timelineStub(item));
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  // SSE stream: streams the case lifecycle as discrete events. The
  // consumer (lib/hooks/useCaseEvents) builds up timeline + agent-status
  // state from these events. Real backend replaces this handler with an
  // actual SSE endpoint; the event shapes stay the same.
  http.get("/api/cases/:id/events", ({ params }) => {
    const id = String(params.id);
    const scenario = scenarioFor(id, detailFor(id));
    if (!scenario) {
      return HttpResponse.json({ error: "case not found", id }, { status: 404 });
    }
    return scenarioToSSE(scenario);
  }),
];
