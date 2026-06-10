"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    // 💡 获取当前浏览器的真实公网基础域名（如 https://mv.example.com），动态适配
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";

    // 1. 调用 Supabase 注册账号
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 确保邮件里的确认按钮 100% 传送到当前公网网址下的 auth 回调页面
        emailRedirectTo: `${currentOrigin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. 账号注册成功后
    // 💡 注意：因为开启了邮箱验证，此时 data.user 存在，但他处于“未激活”状态。
    // 我们在这里先静默把用户名写入 profiles 表。由于我们在数据库底层写了 "on conflict do nothing" 的触发器，
    // 前端的这一次插入如果因为触发器抢跑而冲突，也不会导致后端崩溃。
    if (data.user) {
      try {
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username: username.toLowerCase(),
            display_name: username,
          },
        ]);
      } catch (err) {
        console.log("Profile insert handled by trigger or skip:", err);
      }

      // 🌟 核心改动：展示成功提示，让用户去翻邮箱，不再直接切到 dashboard
      setSuccessMessage(
        "🎉 注册申请提交成功！请立刻前往您的电子邮箱查收激活信，点击链接即可开通账号。",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          创建 MyView 账号
        </h2>
        <p className="mt-1 text-slate-500 text-sm text-center">
          开启你的私人文化记忆归档
        </p>

        {successMessage ? (
          // 邮件发送成功后的漂亮展示皮肤
          <div className="mt-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {successMessage}
            </p>
            <p className="text-xs text-slate-400">
              没有收到？请检查垃圾邮件箱或稍后重试。
            </p>
          </div>
        ) : (
          // 标准注册表单
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">
                唯一用户名 (Username)
              </label>
              <input
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="例如: kuro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                电子邮箱 (Email)
              </label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                密码 (Password)
              </label>
              <input
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-slate-400 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "正在申请数字通关令..." : "立即注册"}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          已有账号？{" "}
          <Link href="/login" className="text-slate-900 font-medium underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
