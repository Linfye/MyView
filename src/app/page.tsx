import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center font-sans">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            MyView
          </h1>
          <p className="text-slate-500 text-sm">
            构建属于你个体的数字文化记忆中枢
          </p>
        </div>

        {/* 核心主页操作按钮群 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            立即登录登录
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 transition-all"
          >
            注册通行证
          </Link>
        </div>

        {/* 💡 主页底部的 About 入口 —— 显得极有情怀与独立站特色 */}
        <div className="pt-8 border-t border-slate-200/60">
          <Link
            href="/about"
            className="text-xs font-medium text-slate-400 hover:text-slate-900 underline underline-offset-4 transition-colors"
          >
            了解 MyView 的产品信念与初心 📖
          </Link>
        </div>
      </div>
    </div>
  );
}
