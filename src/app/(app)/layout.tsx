import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          {/* 左侧 Logo 和 动态路由 */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                MyView
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-slate-900 text-slate-600"
              >
                数据统计
              </Link>
              <Link
                href="/works"
                className="transition-colors hover:text-slate-900 text-slate-600"
              >
                书影归档
              </Link>
              <Link
                href="/friends"
                className="transition-colors hover:text-slate-900 text-slate-600"
              >
                密友圈
              </Link>

              {/* 💡 满足需求：在这里无缝嵌入关于页面 */}
              <Link
                href="/about"
                className="transition-colors hover:text-slate-900 text-slate-600 font-medium flex items-center gap-1"
              >
                关于 MyView 📖
              </Link>

              {profile?.is_admin && (
                <Link
                  href="/admin"
                  className="transition-colors text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50"
                >
                  👑 维护公共库
                </Link>
              )}
            </nav>
          </div>

          {/* 右侧动态用户信息 */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                {profile?.display_name || "未命名用户"}
              </span>

              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-slate-800 transition-colors">
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

      {/* 页面主体内容 */}
      <main className="flex-1 container mx-auto max-w-screen-2xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
