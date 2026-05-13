// 4 quick-action chips below the timeline. Visual only in Phase 1.
const CHIPS = [
  "Ask @network for ring depth",
  "Request 2nd opinion from policy",
  "Reject — false positive",
  "Escalate to senior team",
];

export function QuickActionChips() {
  return (
    <div className="px-[18px] py-2 flex flex-wrap gap-2">
      {CHIPS.map((label) => (
        <button
          key={label}
          type="button"
          className="rounded-[5px] border border-line bg-surface px-3 py-[5px] text-[11.5px] text-ink-muted hover:bg-surface-muted cursor-pointer"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
