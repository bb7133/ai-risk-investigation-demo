"use client";

import { create } from "zustand";

// The "New case" toast is a single push-notification card — only one
// is ever on-screen. `key` bumps each time the analyst hits the button
// so the animation re-fires even if the toast was already open. The
// payload carries the new case's transaction summary so tap-to-review
// can route to the right case id.

export type ToastPayload = {
  caseId: string;
  amount: string;
  merchant: string;
  city: string;
};

type ToastStore = {
  payload: ToastPayload | null;
  key: number;
  show: (payload: ToastPayload) => void;
  dismiss: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  payload: null,
  key: 0,
  show: (payload) => set((s) => ({ payload, key: s.key + 1 })),
  dismiss: () => set({ payload: null }),
}));
