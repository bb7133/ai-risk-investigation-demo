import { http, HttpResponse } from "msw";

import { SARAH_CHEN } from "./data/sarah-chen";
import { TIMELINE_SARAH_CHEN } from "./data/sarah-chen-timeline";
import { timelineStub } from "./data/case-stub";
import { scenarioFor } from "./data/scenarios";
import { scenarioToSSE } from "./sse";
import {
  createCase,
  getCaseDetail,
  getResolvedMeta,
  listCases,
  markResolved,
} from "./state";

// All endpoints route through mocks/state.ts — a per-tab mutable store
// seeded with the static sidebar list + Sarah Chen's full Case. POST
// /api/cases mutates that store so subsequent GETs see the new case.
// POST /api/cases/:id/execute flips a case to resolved.

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

  // POST /api/cases/:id/execute — analyst clicks Execute on the
  // synthesis card. Marks the case resolved and returns the dispute
  // metadata. Idempotent — subsequent calls return the same meta.
  http.post("/api/cases/:id/execute", ({ params }) => {
    const meta = markResolved(String(params.id));
    if (!meta) {
      return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
    }
    return HttpResponse.json(meta, { status: 200 });
  }),

  http.get("/api/cases/:id/timeline", ({ params }) => {
    if (params.id === SARAH_CHEN.id) return HttpResponse.json(TIMELINE_SARAH_CHEN);
    const detail = getCaseDetail(String(params.id));
    if (detail) return HttpResponse.json(timelineStub(detail));
    return HttpResponse.json({ error: "case not found", id: params.id }, { status: 404 });
  }),

  // SSE stream — see lib/hooks/use-case-events.ts on the consumer side.
  // Live delays apply only to status='investigating'. Awaiting / resolved
  // cases play as a snapshot (delays scaled to zero) so the analyst sees
  // the full conversation immediately and can act. case_resolved is
  // appended only when MSW state has the case marked resolved.
  http.get("/api/cases/:id/events", ({ params }) => {
    const id = String(params.id);
    const detail = getCaseDetail(id);
    if (!detail) {
      return HttpResponse.json({ error: "case not found", id }, { status: 404 });
    }

    let scenario = scenarioFor(id, detail);
    if (!scenario) {
      return HttpResponse.json({ error: "case not found", id }, { status: 404 });
    }

    const resolved = getResolvedMeta(id);
    if (resolved) {
      scenario = [
        ...scenario,
        { delay: 0, event: { type: "case_resolved", resolved } },
      ];
    }

    const live = detail.status === "investigating";
    return scenarioToSSE(scenario, live ? 1 : 0);
  }),
];
