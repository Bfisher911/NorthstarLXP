"use client";

import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import { AlertTriangle, CheckCircle2, Info, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastPayload {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

type ToastContextValue = {
  toast: (payload: ToastPayload) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

interface Entry extends ToastPayload {
  id: string;
  open: boolean;
}

const variantIcon: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const variantTone: Record<ToastVariant, string> = {
  default: "border-border bg-popover text-foreground",
  success: "border-emerald-500/40 bg-emerald-500/10 text-foreground",
  error: "border-rose-500/40 bg-rose-500/10 text-foreground",
  info: "border-sky-500/40 bg-sky-500/10 text-foreground",
};

const iconTone: Record<ToastVariant, string> = {
  default: "text-foreground",
  success: "text-emerald-500",
  error: "text-rose-500",
  info: "text-sky-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Entry[]>([]);

  const toast = React.useCallback((payload: ToastPayload) => {
    const id = payload.id ?? Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...payload, id, open: true }]);
  }, []);

  const close = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => {
          const variant = t.variant ?? "default";
          const Icon = variantIcon[variant];
          return (
            <Toast.Root
              key={t.id}
              open={t.open}
              onOpenChange={(o) => !o && close(t.id)}
              duration={t.duration ?? 5000}
              className={cn(
                "group pointer-events-auto relative mb-2 flex w-80 items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur transition-all",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=open]:slide-in-from-right",
                variantTone[variant]
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconTone[variant])} />
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-sm font-semibold leading-snug">{t.title}</Toast.Title>
                {t.description && (
                  <Toast.Description className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </Toast.Description>
                )}
                {t.action && (
                  <Toast.Action asChild altText={t.action.label}>
                    <button
                      onClick={() => {
                        t.action!.onClick();
                        close(t.id);
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium hover:bg-accent"
                    >
                      <Undo2 className="h-3 w-3" />
                      {t.action.label}
                    </button>
                  </Toast.Action>
                )}
              </div>
              <Toast.Close
                className="rounded p-0.5 text-muted-foreground transition hover:bg-muted"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Toast.Close>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-96 max-w-[calc(100vw-2rem)] flex-col p-0 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
