import { http, HttpResponse } from "msw";

import { CASES } from "./data/cases";
import { SARAH_CHEN } from "./data/sarah-chen";
import { TIMELINE_SARAH_CHEN } from "./data/sarah-chen-timeline";

// Phase 1: only Sarah Chen (CASE-2461) has a full case + timeline.
// Other 11 sidebar cases are stubs — getCase / getCaseTimeline return 404.

export const handlers = [
  http.get("/api/cases", () => HttpResponse.json(CASES)),

  http.get("/api/cases/:id", ({ params }) => {
    if (params.id === "CASE-2461") {
      return HttpResponse.json(SARAH_CHEN);
    }
    return HttpResponse.json(
      { error: "case detail not implemented in phase 1", id: params.id },
      { status: 404 },
    );
  }),

  http.get("/api/cases/:id/timeline", ({ params }) => {
    if (params.id === "CASE-2461") {
      return HttpResponse.json(TIMELINE_SARAH_CHEN);
    }
    return HttpResponse.json(
      { error: "timeline not implemented in phase 1", id: params.id },
      { status: 404 },
    );
  }),
];
