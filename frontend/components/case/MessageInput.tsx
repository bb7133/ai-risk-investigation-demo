"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { sendCaseMessage } from "@/lib/api/cases";
import { useCaseStreamStore } from "@/lib/store/case-stream";

type Props = { caseId: string };

export function MessageInput({ caseId }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholder = `Message #${caseId} · @customer @merchant @network @policy`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    try {
      const events = await sendCaseMessage(caseId, text);
      const stream = useCaseStreamStore.getState();
      for (const item of events) stream.apply(item);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="px-[18px] py-3 border-t border-line bg-surface">
      <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2">
        <input
          type="text"
          value={message}
          disabled={sending}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="rounded-[5px] border border-line bg-transparent px-[10px] py-[3px] text-[11px] text-ink-muted cursor-pointer hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      {error && <div className="mt-2 text-[11px] text-red-600">{error}</div>}
    </form>
  );
}
