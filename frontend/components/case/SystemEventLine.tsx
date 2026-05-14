import type { SystemEvent } from "@/types/api";

export function SystemEventLine({ event }: { event: SystemEvent }) {
  return (
    <div className="py-2 text-center">
      <span className="mono text-[10.5px] text-ink-subtle tracking-[0.3px]">
        <span className="text-ink-faint mr-[6px]">{event.ts}</span>
        {event.text}
      </span>
    </div>
  );
}

export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[10px] my-1 mb-[18px]">
      <div className="flex-1 h-px bg-line-subtle" />
      <span className="mono text-[9.5px] font-semibold tracking-[0.8px] text-ink-subtle">
        {label}
      </span>
      <div className="flex-1 h-px bg-line-subtle" />
    </div>
  );
}
