import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  BookOpen,
  ChartNoAxesColumn,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. 获取当前登录的 Auth 用户对象
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 去 profiles 表里捞出用户的昵称、用户名、以及管理员和头像状态
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, is_admin")
    .eq("id", user.id)
    .single();

  // 生成一个优雅的右上角圆形文字头像
  const initialLetter = (profile?.display_name || profile?.username || "M")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_28rem),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/works"
              prefetch={false}
              className="flex items-center space-x-2"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                M
              </span>
              <span className="font-bold text-slate-950 tracking-tight text-lg">
                MyView
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/works"
                prefetch={false}
                className="flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-950"
              >
                <BookOpen className="size-4" />
                书影归档
              </Link>
              <Link
                href="/dashboard"
                prefetch={false}
                className="flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-950"
              >
                <ChartNoAxesColumn className="size-4" />
                数据统计
              </Link>
              <Link
                href="/friends"
                prefetch={false}
                className="flex items-center gap-1.5 text-slate-600 transition-colors hover:text-slate-950"
              >
                <Users className="size-4" />
                密友圈
              </Link>

              <Link
                href="/about"
                prefetch={false}
                className="text-slate-600 transition-colors hover:text-slate-950"
              >
                关于
              </Link>

              {profile?.is_admin && (
                <Link
                  href="/admin"
                  prefetch={false}
                  className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <Shield className="size-3.5" />
                  公共库
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              prefetch={false}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <Settings className="size-4 text-slate-400 transition-colors group-hover:text-slate-700" />
              <span className="text-sm text-slate-600 font-medium group-hover:text-slate-950 transition-colors">
                {profile?.display_name || "未命名用户"}
              </span>

              <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-slate-800 transition-colors">
                {initialLetter}
              </div>
            </Link>

            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/login");
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
              >
                退出
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-screen-2xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
