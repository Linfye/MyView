import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          {/* 左侧 Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                MyView
              </span>
            </Link>

            {/* 导航菜单 */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-slate-900 text-slate-600"
              >
                看板
              </Link>
              <Link
                href="/works"
                className="transition-colors hover:text-slate-900 text-slate-600"
              >
                书影归档
              </Link>
            </nav>
          </div>

          {/* 右侧用户动作（预留头像/退出位置） */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">私人模式</span>
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
