"use client";

import { useEffect, useState, type ReactNode } from "react";

let startPromise: Promise<void> | null = null;

function ensureWorker(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (startPromise) return startPromise;
  startPromise = import("@/mocks/browser").then(({ worker }) =>
    worker
      .start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
      })
      .then(() => undefined),
  );
  return startPromise;
}

// Gates the app on MSW being ready. Phase 1 always runs MSW (there is no
// real backend yet) so this provider has no NODE_ENV gating. When the
// backend is real, swap this to start MSW only in development.
export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureWorker().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-ink-subtle text-[12px]">
        Starting up…
      </div>
    );
  }
  return <>{children}</>;
}
