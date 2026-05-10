import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface UIState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  notify: (message: unknown, type?: ToastType, title?: string) => void;
}

function safeStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "Error inesperado";
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const safe: Toast = {
      ...toast,
      id,
      message: safeStr(toast.message),
      title: toast.title != null ? safeStr(toast.title) : undefined,
    };
    set((s) => ({ toasts: [...s.toasts, safe] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  notify: (message, type = "info", title) =>
    get().addToast({ type, message: safeStr(message), title }),
}));
