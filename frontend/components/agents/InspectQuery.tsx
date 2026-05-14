import type { AgentId, InspectItem } from "@/types/api";
import { AGENT_META } from "@/lib/agents";

type Props = { items: InspectItem[]; agent: AgentId };

// Phase 1 renders Inspect query in its EXPANDED state to match the
// mockups (03–07 all show it open). The collapsible toggle behavior is
// deferred to a later phase — the doc lists it as visual only.
export function InspectQuery({ items, agent }: Props) {
  return (
    <div className="mt-1">
      <div className="inline-flex items-center gap-[5px] mono text-[10.5px] tracking-[0.3px] py-[2px]">
        <span className="text-ink-faint inline-block rotate-90">▸</span>
        <span className="text-ink-muted">Inspect query</span>
        <span className="text-ink-faint">· {countLabel(items)}</span>
      </div>
      <div
        className="mt-[6px] max-w-[520px] rounded-[5px] px-[10px] py-2"
        style={{
          background: "var(--bg-2)",
          border: "1px dashed var(--border-base)",
        }}
      >
        <div className="mono text-[8.5px] font-semibold tracking-[0.7px] text-ink-subtle mb-[6px]">
          HOW THIS WAS COMPUTED
        </div>
        <div className="flex flex-col gap-[6px]">
          {items.map((it, i) => (
            <InspectItemView key={i} item={it} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

function countLabel(items: InspectItem[]): string {
  const tools = items.filter((i) => i.kind === "tool").length;
  const files = items.filter((i) => i.kind === "file").length;
  const parts: string[] = [];
  if (tools) parts.push(`${tools} ${tools === 1 ? "query" : "queries"}`);
  if (files) parts.push(`${files} ${files === 1 ? "file" : "files"}`);
  return parts.join(" · ");
}

function InspectItemView({ item, agent }: { item: InspectItem; agent: AgentId }) {
  const a = AGENT_META[agent];
  if (item.kind === "tool") {
    return (
      <div
        className="flex items-center gap-2 flex-wrap rounded-[4px] px-[9px] py-[5px]"
        style={{ background: "var(--bg-1)", border: "1px solid var(--border-subtle)" }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          stroke={a.color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6h8M6 2l4 4-4 4" />
        </svg>
        <span
          className="mono text-[10.5px] font-semibold"
          style={{ color: a.color }}
        >
          {item.name}
        </span>
        <span className="mono text-[10.5px] text-ink-muted">{item.q}</span>
      </div>
    );
  }
  if (item.kind === "result") {
    return (
      <div
        className="mono text-[10.5px] text-ink-muted leading-[1.5] pl-[10px]"
        style={{ borderLeft: "2px solid var(--border-base)" }}
      >
        ← {item.text}
      </div>
    );
  }
  // file
  return (
    <div
      className="inline-flex items-center gap-[9px] self-start rounded-[4px] px-[9px] py-[5px]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--border-subtle)" }}
    >
      <FilePill name={item.name} />
      <span className="mono text-[10.5px] text-ink">{item.name}</span>
      <span className="text-[10px] text-ink-faint">· {item.size}</span>
      <span className="text-[10px] text-ink-faint">· drive9</span>
    </div>
  );
}

function FilePill({ name }: { name: string }) {
  const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] || "file").toUpperCase();
  return (
    <span
      className="relative shrink-0"
      style={{
        width: 18,
        height: 22,
        background: "var(--bg-2)",
        border: "1px solid var(--border-strong)",
        borderRadius: 2,
      }}
    >
      <span
        className="mono absolute bottom-[2px] left-0 right-0 text-center text-[6.5px] font-bold text-ink-muted tracking-[0.3px]"
      >
        {ext}
      </span>
    </span>
  );
}
