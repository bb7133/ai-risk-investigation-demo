import type { Case } from "@/types/api";

type Props = { caseDetail: Case };

export function CaseHeader({ caseDetail }: Props) {
  const { customer_detail, transaction } = caseDetail;
  return (
    <div className="flex items-center gap-[14px] border-b border-line bg-surface px-[18px] py-3">
      {/* SC avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0"
        style={{
          background: "color-mix(in oklab, var(--c-customer) 18%, white)",
          color: "var(--c-customer)",
          border: "1px solid color-mix(in oklab, var(--c-customer) 30%, transparent)",
        }}
      >
        {customer_detail.initials}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-[10px] flex-wrap">
          <span className="text-[15px] font-semibold text-ink tracking-[-0.2px]">
            {customer_detail.name}
          </span>
          <span className="text-[11px] text-ink-subtle">
            {customer_detail.tier} · since {customer_detail.since}
          </span>
          <span className="w-px h-3 bg-line" />
          <span className="mono text-[11px] text-ink-subtle">#</span>
          <span className="mono text-[11.5px] font-semibold text-ink-muted">
            {caseDetail.id}
          </span>
          <span
            className="mono text-[9.5px] font-bold tracking-[0.6px] rounded-[3px] px-[6px] py-[2px]"
            style={{
              background: "color-mix(in oklab, var(--sig-danger) 12%, white)",
              color: "var(--sig-danger)",
            }}
          >
            HIGH PRIORITY
          </span>
        </div>

        {/* Txn row */}
        <div className="flex items-baseline gap-[6px] mt-1 text-[11px] text-ink-subtle flex-wrap">
          <span
            className="mono font-semibold"
            style={{ color: "var(--sig-danger)" }}
          >
            {transaction.amount}
          </span>
          <span>·</span>
          <span>{transaction.merchant}</span>
          <span>·</span>
          <span>{transaction.city}</span>
          <span>·</span>
          <span className="mono">{transaction.time}</span>
        </div>
      </div>
    </div>
  );
}
