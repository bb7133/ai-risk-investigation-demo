import { http, HttpResponse } from "msw";

import { SARAH_CHEN } from "./data/sarah-chen";
import { TIMELINE_SARAH_CHEN } from "./data/sarah-chen-timeline";
import { timelineStub } from "./data/case-stub";
import { scenarioFor } from "./data/scenarios";
import { scenarioToSSE } from "./sse";
import { createCase, getCaseDetail, listCases } from "./state";

// All endpoints route through mocks/state.ts — a per-tab mutable store
// seeded with the static sidebar list + Sarah Chen's full Case. POST
// /api/cases mutates that store so subsequent GETs see the new case.

export const handlers = [
  http.get("/api/cases", () => HttpResponse.json(listCases())),

  http.post("/api/cases", () => {
    const created = createCase();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/cases/:id", ({ params }) => {
    const detail = getCaseDetail(String(params.id));
    if (detail) return HttpResponse.json(detail);
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  http.get("/api/cases/:id/timeline", ({ params }) => {
    if (params.id === SARAH_CHEN.id) return HttpResponse.json(TIMELINE_SARAH_CHEN);
    const detail = getCaseDetail(String(params.id));
    if (detail) return HttpResponse.json(timelineStub(detail));
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  // SSE stream — see lib/hooks/use-case-events.ts on the consumer side.
  http.get("/api/cases/:id/events", ({ params }) => {
    const id = String(params.id);
    const scenario = scenarioFor(id, getCaseDetail(id));
    if (!scenario) {
      return HttpResponse.json({ error: "case not found", id }, { status: 404 });
    }
    return scenarioToSSE(scenario);
  }),
];
