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

function shouldUseMSW(): boolean {
  return ["1", "true", "yes"].includes(
    (process.env.NEXT_PUBLIC_USE_MSW || "").toLowerCase(),
  );
}

// Gates the app on MSW only when explicitly requested. The default path
// uses the Next.js API adapter, which reads real data from the backend
// storage service on port 8787.
export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !shouldUseMSW());

  useEffect(() => {
    if (!shouldUseMSW()) return;
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
