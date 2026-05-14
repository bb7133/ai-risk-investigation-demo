import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  caption: string;
  width?: number;
  accent?: string;
};

// Shared chrome around every signature viz: bordered card with the
// chart on top and a footer line carrying the agent caption + tiny
// accent dot.
export function VizFrame({ children, caption, width = 360, accent }: Props) {
  return (
    <div
      className="rounded-[7px] overflow-hidden bg-surface"
      style={{
        border: "1px solid var(--border-base)",
        maxWidth: width,
      }}
    >
      <div className="pt-[10px] px-3 pb-1">{children}</div>
      <div
        className="flex items-center gap-[6px] px-3 py-[7px] text-[11px] leading-[1.4] text-ink-muted"
        style={{
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {accent && (
          <span
            className="w-[6px] h-[6px] rounded-[3px] shrink-0"
            style={{ background: accent }}
          />
        )}
        <span>{caption}</span>
      </div>
    </div>
  );
}
