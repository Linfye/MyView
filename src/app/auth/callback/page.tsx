"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 🔒 核心防御密码：在组件外层声明一个全局标记锁，防止 React 严格模式下的双发并发请求
let isExchanging = false;

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function handleExchangeCode() {
      const code = searchParams.get("code");

      if (!code) {
        setStatus("error");
        return;
      }

      // 🛑 如果已经有一个请求在执行换取了，直接拦截拦截，不准跑第二次！
      if (isExchanging) return;
      isExchanging = true;

      // 💡 核心：拿着邮箱里的 code 密码向 Supabase 换取公网真实的登录令牌
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Token exchange failed:", error);
        setStatus("error");
        isExchanging = false; // 只有彻底失败了才解锁，允许重试
      } else {
        // 验证成功，开启倒计时沙漏
        setStatus("success");
      }
    }

    handleExchangeCode();

    // 组件卸载时重置锁状态
    return () => {
      isExchanging = false;
    };
  }, [searchParams, supabase]);

  // 🌟 倒计时核心时钟控制器
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      // 倒计时归零，顺滑平移到看板
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center space-y-6 transform transition-all">
        {/* 1. 加载中状态 */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-800">
              正在解密您的文化记忆通道...
            </h2>
            <p className="text-xs text-slate-400">
              正在校验全球网络鉴权令牌，请稍候
            </p>
          </div>
        )}

        {/* 2. 验证成功状态（名场面） */}
        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            {/* 炫酷的动态大绿勾 */}
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              🎉 邮箱验证成功！
            </h2>
            <p className="text-sm text-slate-500 px-4">
              欢迎来到 MyView。您的专属安全数字秘钥已成功下发至当前浏览器。
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
                ⏳{" "}
                <span className="font-mono text-sm font-bold text-amber-400">
                  {countdown}
                </span>{" "}
                秒后自动开启看板
              </span>
            </div>
          </div>
        )}

        {/* 3. 令牌失效/过期状态 */}
        {status === "error" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
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

// 💡 Next.js 15 强制要求：在客户端组件中使用 useSearchParams 必须包裹在 Suspense 里面！
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
