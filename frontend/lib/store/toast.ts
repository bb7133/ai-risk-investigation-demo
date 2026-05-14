"use client";

import { create } from "zustand";

// The "New case" toast is a single push-notification card — only one
// is ever on-screen. `key` bumps each time the analyst hits the button
// so the animation re-fires even if the toast was already open.

type ToastStore = {
  open: boolean;
  key: number;
  show: () => void;
  dismiss: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  open: false,
  key: 0,
  show: () => set((s) => ({ open: true, key: s.key + 1 })),
  dismiss: () => set({ open: false }),
}));
