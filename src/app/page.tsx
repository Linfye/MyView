import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.12),transparent_26rem),linear-gradient(135deg,#f8fafc_0%,#eef2f7_100%)] p-6 text-center font-sans">
      <div className="w-full max-w-xl space-y-8">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-slate-950/10">
          M
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-950 tracking-tight">
            MyView
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
            构建属于你个体的数字文化记忆中枢
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition-colors duration-150 hover:bg-slate-800"
          >
            <LogIn className="size-4" />
            立即登录
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors duration-150 hover:bg-white"
          >
            注册通行证
          </Link>
        </div>

        <div className="pt-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            了解 MyView 的产品信念
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
