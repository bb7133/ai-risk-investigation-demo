type Props = { caseId: string };

// Visual-only message input. Send button is a no-op in Phase 1.
export function MessageInput({ caseId }: Props) {
  const placeholder = `Message #${caseId} · @customer @merchant @network @policy`;
  return (
    <div className="px-[18px] py-3 border-t border-line bg-surface">
      <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none"
        />
        <button
          type="button"
          className="rounded-[5px] border border-line bg-transparent px-[10px] py-[3px] text-[11px] text-ink-muted cursor-pointer hover:bg-surface-muted"
        >
          Send
        </button>
      </div>
    </div>
  );
}
