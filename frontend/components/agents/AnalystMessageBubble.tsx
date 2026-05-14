import type { AnalystMessage } from "@/types/api";
import { ANALYST_META } from "@/lib/agents";
import { ParsedText } from "./ParsedText";

export function AnalystMessageBubble({ msg }: { msg: AnalystMessage }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3 py-[6px] pb-3">
      <span
        className="mono w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold select-none"
        style={{
          background: `color-mix(in oklab, ${ANALYST_META.color} 18%, white)`,
          color: ANALYST_META.color,
          border: `1px solid color-mix(in oklab, ${ANALYST_META.color} 35%, transparent)`,
        }}
        aria-hidden
      >
        {ANALYST_META.initials}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink">
            {ANALYST_META.name}
          </span>
          <span
            className="mono text-[9px] font-semibold tracking-[0.5px] px-[5px] py-px rounded-[3px]"
            style={{
              color: ANALYST_META.color,
              background: `color-mix(in oklab, ${ANALYST_META.color} 10%, white)`,
              border: `1px solid color-mix(in oklab, ${ANALYST_META.color} 22%, transparent)`,
            }}
          >
            ANALYST
          </span>
          <span className="mono text-[10px] text-ink-faint">{msg.ts}</span>
        </div>
        <div className="mt-1 text-[13px] text-ink leading-[1.55]">
          <ParsedText text={msg.text} />
        </div>
      </div>
    </div>
  );
}
