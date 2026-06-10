"use client"; // 声明这是一个客户端组件，因为我们需要处理用户的点击事件和输入

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 💡 获取当前浏览器的真实公网基础域名（如 https://mv.example.com），动态适配，彻底抛弃 localhost 记忆！
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";

    // 1. 调用 Supabase 注册账号，并显式绑定公网传送门
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 确保邮件里的确认按钮 100% 传送回当前公网网址下的 auth 回调
        emailRedirectTo: `${currentOrigin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. 账号注册成功后！
    // 因为数据库 Trigger 已经帮我们把空壳创建好了，我们前端现在只需要负责「更新」用户名即可！
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: username.toLowerCase(),
          display_name: username,
        })
        .eq("id", data.user.id); // 🔍 精准更新刚刚生成的这行名片

      if (profileError) {
        setError(
          "账号创建成功，但个性化用户名设置失败：" + profileError.message,
        );
        setLoading(false);
        return;
      }
    }

    // 3. 注册成功，跳转到看板
    router.push("/dashboard");
    router.refresh();
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
            {loading ? "注册中..." : "立即注册"}
          </Button>
        </form>

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
