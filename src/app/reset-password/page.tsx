"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("新密码至少需要 6 个字符。");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的新密码不一致。");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/works");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc,#eef2f7)] p-6">
      <div className="app-surface w-full max-w-md rounded-2xl p-8">
        <div className="mx-auto grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <KeyRound className="size-5" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
          设置新密码
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          邮箱验证已通过，请输入你的新密码。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              新密码
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full field-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              再次输入新密码
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full field-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "正在保存..." : "保存新密码"}
          </Button>
        </form>
      </div>
    </div>
  );
}
