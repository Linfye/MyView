"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          登录 MyView
        </h2>
        <p className="mt-1 text-slate-500 text-sm text-center">
          进入你的私人精神角落
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              电子邮箱 (Email)
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-slate-400 focus:outline-none"
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
            {loading ? "登录中..." : "登 录"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          还没有账号？{" "}
          <Link href="/signup" className="text-slate-900 font-medium underline">
            立即注册
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-500">
          忘记密码？{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-teal-700 underline underline-offset-4"
          >
            通过邮箱重置
          </Link>
        </p>
      </div>
    </div>
  );
}
