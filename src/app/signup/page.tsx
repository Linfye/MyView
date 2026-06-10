"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${currentOrigin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: username.toLowerCase(),
          display_name: username,
        },
      ]);

      setSuccessMessage(
        "注册申请提交成功。请前往您的电子邮箱查收激活信，点击链接即可开通账号。",
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
          <div className="mt-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <MailCheck className="size-6" />
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {successMessage}
            </p>
            <p className="text-xs text-slate-400">
              没有收到？请检查垃圾邮件箱或稍后重试。
            </p>
          </div>
        ) : (
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
