"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CheckCircle2, Timer } from "lucide-react";

let isExchanging = false;

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const nextPath = searchParams.get("next") || "/works";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function handleExchangeCode() {
      // 策略 1：首先检查当前浏览器是否已经处于登录状态。
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setStatus("success");
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        setStatus("error");
        return;
      }

      if (isExchanging) return;
      isExchanging = true;

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Token exchange failed:", error);

        const {
          data: { session: recheckSession },
        } = await supabase.auth.getSession();
        if (recheckSession) {
          setStatus("success");
        } else {
          setStatus("error");
          isExchanging = false;
        }
      } else {
        setStatus("success");
      }
    }

    handleExchangeCode();

    return () => {
      isExchanging = false;
    };
  }, [searchParams, supabase]);

  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push(nextPath);
      router.refresh();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, status, router, nextPath]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#eef2f7)] p-6 font-sans">
      <div className="max-w-md w-full app-surface p-8 rounded-2xl text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-800">
              正在接入您的文化记忆归档...
            </h2>
            <p className="text-xs text-slate-400">
              正在为您下发全网安全数字令，请稍候
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner scale-110 transition-transform">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              邮箱验证成功
            </h2>
            <p className="text-sm text-slate-500 px-4">
              欢迎来到 MyView。您的专属安全数字秘钥已成功下发至当前浏览器。
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
                <Timer className="size-3.5" />
                <span className="font-mono text-sm font-bold text-amber-400">
                  {countdown}
                </span>{" "}
                秒后自动继续
              </span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              传送安全令已失效
            </h2>
            <p className="text-xs text-slate-400 px-4 leading-relaxed">
              该邮件验证链接可能已被使用过，或由于超时已在边缘网络中过期。
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                返回登录页重新申请
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
