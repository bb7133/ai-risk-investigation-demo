// Compact muted status line shown above the chips/input.
// Phase 1 renders a static line; later phases will hook this up to live
// agent state.
export function LiveStatusLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-[18px] py-2 text-[11px] text-ink-subtle">
      <span
        className="pulse-dot w-[6px] h-[6px] rounded-full shrink-0"
        style={{ background: "var(--sig-warn)" }}
      />
      <span>{text}</span>
    </div>
  );
}
