"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/lib/store/toast";

const AUTO_DISMISS_MS = 8000;
const TARGET_CASE_ID = "CASE-2461";

// Push-notification style toast — the analyst's perspective on what a
// new fraud alert would look like landing on the customer's phone.
// Ported from NewCaseToast in docs/design/reference-code/case-chat.jsx.
export function ToastHost() {
  const open = useToastStore((s) => s.open);
  const key = useToastStore((s) => s.key);
  const dismiss = useToastStore((s) => s.dismiss);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [open, key, dismiss]);

  function onTap() {
    dismiss();
    router.push(`/cases/${TARGET_CASE_ID}`);
  }

  return (
    <div className="fixed top-[58px] right-4 z-50 pointer-events-none">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1.1] }}
            className="w-[340px] rounded-[14px] overflow-hidden pointer-events-auto"
            style={{
              background: "color-mix(in oklab, white 92%, var(--bg-1))",
              backdropFilter: "saturate(140%) blur(8px)",
              WebkitBackdropFilter: "saturate(140%) blur(8px)",
              border: "1px solid var(--border-base)",
              boxShadow:
                "0 18px 40px rgba(10, 31, 68, 0.18), 0 2px 8px rgba(10, 31, 68, 0.08), 0 0 0 1px rgba(10, 31, 68, 0.03)",
            }}
          >
            {/* Header strip — bank glyph + bank name + just now + dismiss */}
            <div className="flex items-center gap-2 pt-[10px] px-[14px]">
              <span
                className="mono w-5 h-5 rounded-[5px] inline-flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--c-customer), var(--c-merchant))",
                  boxShadow: "0 1px 2px rgba(10,31,68,0.18)",
                }}
              >
                $
              </span>
              <span className="text-[11.5px] font-semibold text-ink-muted tracking-[-0.1px]">
                Bank of CLAiMS
              </span>
              <span className="text-[11px] text-ink-subtle">· just now</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismiss}
                className="ml-auto w-[18px] h-[18px] flex items-center justify-center rounded-full text-ink-faint hover:text-ink-subtle cursor-pointer"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M3 3L9 9M9 3L3 9" />
                </svg>
              </button>
            </div>

            {/* Body — subject + amount + merchant + city + CTA */}
            <div className="px-[14px] pt-[6px] pb-3">
              <div className="text-[14px] font-semibold text-ink mt-[2px] tracking-[-0.15px]">
                Verify a charge
              </div>
              <div className="mt-1 text-[12.5px] leading-[1.45]">
                <span
                  className="mono font-semibold"
                  style={{ color: "var(--sig-danger)" }}
                >
                  $4,280.00
                </span>
                <span className="text-ink-muted"> at PT Sunset Holdings</span>
              </div>
              <div className="text-[12px] text-ink-subtle mt-px">Bali, ID</div>
              <button
                type="button"
                onClick={onTap}
                className="mt-[10px] w-full rounded-lg px-[10px] py-[7px] text-[12px] font-semibold cursor-pointer tracking-[-0.1px] text-white"
                style={{ background: "var(--text-1)", border: "none" }}
              >
                Tap to review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
