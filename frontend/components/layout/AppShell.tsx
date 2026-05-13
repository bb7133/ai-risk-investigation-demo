import type { ReactNode } from "react";
import type { CaseListItem } from "@/types/api";
import { TopBar } from "./TopBar";
import { CasesSidebar } from "./CasesSidebar";

type Props = {
  cases: CaseListItem[];
  activeCaseId: string;
  awaitingCount: number;
  highPriorityUnread: number;
  rightPanel?: ReactNode;
  children: ReactNode;
};

export function AppShell({
  cases,
  activeCaseId,
  awaitingCount,
  highPriorityUnread,
  rightPanel,
  children,
}: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-bg-0 text-ink overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <CasesSidebar
          cases={cases}
          activeCaseId={activeCaseId}
          awaitingCount={awaitingCount}
          highPriorityUnread={highPriorityUnread}
        />
        <main className="flex-1 min-w-0 flex flex-col min-h-0">{children}</main>
        {rightPanel}
      </div>
    </div>
  );
}
