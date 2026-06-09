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

  // 2. 去 profiles 表里捞出用户的 display_name 还有全新的 is_admin 状态！
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .single();

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

              {/* 🌟 核心升级：如果你是管理员，导航栏就会施展魔法，凭空多出一个专享入口 */}
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
            <span className="text-sm text-slate-600 font-medium">
              你好，{profile?.display_name || "无名归档者"}
            </span>

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
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
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
