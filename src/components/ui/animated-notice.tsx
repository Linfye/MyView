"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NoticeVariant = "success" | "error" | "info";

interface NoticeState {
  id: number;
  title: string;
  message?: string;
  variant: NoticeVariant;
}

interface ConfirmState {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  dangerous?: boolean;
  resolve: (value: boolean) => void;
}

const noticeStyles = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 text-red-900",
    iconClassName: "text-red-600",
  },
  info: {
    icon: Info,
    className: "border-slate-200 bg-white text-slate-900",
    iconClassName: "text-slate-500",
  },
};

export function useAnimatedNotice() {
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback(
    (title: string, message?: string, variant: NoticeVariant = "info") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setNotice({ id: Date.now(), title, message, variant });
      timerRef.current = setTimeout(() => setNotice(null), 3200);
    },
    [],
  );

  const confirm = useCallback(
    (options: Omit<ConfirmState, "resolve">) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ ...options, resolve });
      }),
    [],
  );

  const closeConfirm = useCallback(
    (value: boolean) => {
      confirmState?.resolve(value);
      setConfirmState(null);
    },
    [confirmState],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const NoticeHost = useCallback(() => {
    const style = notice ? noticeStyles[notice.variant] : null;
    const Icon = style?.icon;

    return (
      <>
        {notice && style && Icon && (
          <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm justify-end">
            <div
              key={notice.id}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-3 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200",
                style.className,
              )}
            >
              <Icon className={cn("mt-0.5 size-4", style.iconClassName)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">
                  {notice.title}
                </p>
                {notice.message && (
                  <p className="mt-0.5 text-xs leading-5 opacity-75">
                    {notice.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-current opacity-45 transition-colors hover:bg-black/5 hover:opacity-80"
                onClick={() => setNotice(null)}
                aria-label="关闭通知"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {confirmState && (
          <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border",
                    confirmState.dangerous
                      ? "border-red-100 bg-red-50 text-red-600"
                      : "border-slate-200 bg-slate-50 text-slate-700",
                  )}
                >
                  {confirmState.dangerous ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    <Loader2 className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-950">
                    {confirmState.title}
                  </h2>
                  {confirmState.message && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {confirmState.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => closeConfirm(false)}
                >
                  {confirmState.cancelText || "取消"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={confirmState.dangerous ? "destructive" : "default"}
                  onClick={() => closeConfirm(true)}
                >
                  {confirmState.confirmText || "确认"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }, [closeConfirm, confirmState, notice]);

  return { notify, confirm, NoticeHost };
}
