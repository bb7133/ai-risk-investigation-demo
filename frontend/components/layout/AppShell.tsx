import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { CasesSidebar } from "./CasesSidebar";

type Props = {
  activeCaseId: string;
  rightPanel?: ReactNode;
  children: ReactNode;
};

export function AppShell({ activeCaseId, rightPanel, children }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-bg-0 text-ink overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <CasesSidebar activeCaseId={activeCaseId} />
        <main className="flex-1 min-w-0 flex flex-col min-h-0">{children}</main>
        {rightPanel}
      </div>
    </div>
  );
}
