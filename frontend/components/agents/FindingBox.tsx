import { AlertTriangle } from "lucide-react";

export function FindingBox({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-2 px-[10px] py-[7px] rounded-[5px]"
      style={{
        background: "color-mix(in oklab, var(--sig-warn) 8%, white)",
        border: "1px solid color-mix(in oklab, var(--sig-warn) 22%, transparent)",
        borderLeft: "3px solid var(--sig-warn)",
      }}
    >
      <AlertTriangle
        className="mt-[2px] h-[13px] w-[13px] shrink-0"
        strokeWidth={1.8}
        style={{ color: "var(--sig-warn)" }}
      />
      <div>
        <div
          className="mono text-[9px] font-bold tracking-[0.6px] uppercase"
          style={{ color: "var(--sig-warn)" }}
        >
          Finding
        </div>
        <div className="text-[12.5px] text-ink mt-px font-medium">{text}</div>
      </div>
    </div>
  );
}
