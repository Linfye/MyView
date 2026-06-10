"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      },
    );

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("重置邮件已发送，请打开邮箱中的链接继续设置新密码。");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#eef2f7)] p-6">
      <div className="app-surface w-full max-w-md rounded-2xl p-8">
        <div className="mx-auto grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <MailCheck className="size-5" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
          重置密码
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          输入注册邮箱，我们会发送一封验证邮件。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              电子邮箱
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full field-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-xs text-emerald-700">
              {message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "正在发送..." : "发送重置邮件"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          想起密码了？{" "}
          <Link href="/login" className="font-medium text-teal-700 underline">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}
