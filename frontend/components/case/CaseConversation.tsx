import type { TimelineEntry } from "@/types/api";
import {
  SystemEventLine,
  DateSeparator,
} from "./SystemEventLine";

type Props = { entries: TimelineEntry[] };

// The full timeline dispatcher.
// Phase 1 will fill in agent / analyst / synthesis renderers as later
// commits land — until then, those entries render as a faint stub so the
// app still builds.
export function CaseConversation({ entries }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-bg-0 px-[18px] py-4">
      <DateSeparator label="Today" />
      {entries.map((entry, i) => (
        <TimelineEntryView key={i} entry={entry} />
      ))}
    </div>
  );
}

function TimelineEntryView({ entry }: { entry: TimelineEntry }) {
  switch (entry.type) {
    case "system":
      return <SystemEventLine event={entry} />;
    case "agent":
    case "analyst":
    case "synthesis":
      // Replaced by dedicated components in commits 7 and 8.
      return (
        <div className="my-2 text-[10.5px] mono text-ink-faint">
          [{entry.type}
          {entry.type === "agent" ? ` · ${entry.agent}` : ""} · {entry.ts}]
        </div>
      );
  }
}
