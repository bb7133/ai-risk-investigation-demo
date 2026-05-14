"use client";

import { create } from "zustand";
import type { CaseListItem } from "@/types/api";

// Holds the sidebar case list as mutable client-side state.
// Unread badges decrement on click; the underlying mock data is not
// mutated, so a hard refresh resets the badges.

type CasesStore = {
  cases: CaseListItem[];
  hydrated: boolean;
  hydrate: (cases: CaseListItem[]) => void;
  markRead: (id: string) => void;
  addCase: (item: CaseListItem) => void;
};

export const useCasesStore = create<CasesStore>((set) => ({
  cases: [],
  hydrated: false,
  hydrate: (cases) => set({ cases, hydrated: true }),
  markRead: (id) =>
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    })),
  // Prepend so the new case appears at the top of whatever section
  // it belongs to (investigating cases sort within their section).
  addCase: (item) =>
    set((s) => ({ cases: [item, ...s.cases.filter((c) => c.id !== item.id)] })),
}));
