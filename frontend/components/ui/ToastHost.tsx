"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useToastStore, type Toast } from "@/lib/store/toast";

const AUTO_DISMISS_MS = 4000;

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed top-[58px] right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="rounded-md min-w-[260px] flex items-start gap-2 px-3 py-[10px] pointer-events-auto"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border-base)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <CheckCircle2
        className="h-4 w-4 mt-px shrink-0"
        strokeWidth={1.8}
        style={{ color: "var(--sig-ok)" }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-ink">{toast.title}</div>
        {toast.subtitle && (
          <div className="mono text-[10.5px] text-ink-subtle mt-px">
            {toast.subtitle}
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="text-ink-faint hover:text-ink-subtle cursor-pointer mt-px"
      >
        <X className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </motion.div>
  );
}
