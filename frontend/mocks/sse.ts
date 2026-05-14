import type { Scenario } from "@/types/api";

// Wraps a scripted scenario in a text/event-stream Response. Each step
// fires after its `delay` (ms) and emits the event as a single SSE
// "data: …\n\n" frame. When the consumer closes the stream we set a
// cancel flag so the emit loop exits on its next tick instead of
// throwing into a closed controller.
//
// delayMultiplier scales every delay uniformly:
//   1.0 → live stream (agents arrive over time)
//   0   → snapshot   (every event fires immediately, fills the page
//                     in a single tick)
export function scenarioToSSE(
  scenario: Scenario,
  delayMultiplier = 1,
): Response {
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const step of scenario) {
          const delay = step.delay * delayMultiplier;
          if (delay > 0) await sleep(delay);
          if (cancelled) return;
          const line = `data: ${JSON.stringify(step.event)}\n\n`;
          controller.enqueue(encoder.encode(line));
        }
      } catch (err) {
        if (!cancelled) controller.error(err);
        return;
      }
      if (!cancelled) controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
