import { http, HttpResponse } from "msw";

import { CASES } from "./data/cases";
import { SARAH_CHEN } from "./data/sarah-chen";
import { TIMELINE_SARAH_CHEN } from "./data/sarah-chen-timeline";
import { caseStub, timelineStub } from "./data/case-stub";

// Phase 1: Sarah Chen (CASE-2461) has a full timeline. Every other case
// in the sidebar returns a thin stub so navigation does not 404 and the
// "click to read" flow still feels coherent.

export const handlers = [
  http.get("/api/cases", () => HttpResponse.json(CASES)),

  http.get("/api/cases/:id", ({ params }) => {
    if (params.id === "CASE-2461") {
      return HttpResponse.json(SARAH_CHEN);
    }
    const item = CASES.find((c) => c.id === params.id);
    if (item) return HttpResponse.json(caseStub(item));
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  http.get("/api/cases/:id/timeline", ({ params }) => {
    if (params.id === "CASE-2461") {
      return HttpResponse.json(TIMELINE_SARAH_CHEN);
    }
    const item = CASES.find((c) => c.id === params.id);
    if (item) return HttpResponse.json(timelineStub(item));
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),
];
