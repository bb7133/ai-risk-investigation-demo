"use client";

import { create } from "zustand";

export type Toast = {
  id: number;
  title: string;
  subtitle?: string;
};

type ToastStore = {
  toasts: Toast[];
  show: (title: string, subtitle?: string) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (title, subtitle) =>
    set((s) => ({
      toasts: [...s.toasts, { id: nextId++, title, subtitle }],
    })),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
