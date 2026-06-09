import { Button } from "@/components/ui/button";
// 1. 引入 Next.js 专用的 Link 组件
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          MyView
        </h1>
        <p className="mt-2 text-slate-500 text-sm">我的私人文化记忆系统</p>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            今日格言
          </p>
          <p className="mt-1 text-slate-700 italic text-sm">
            "一个人的记忆就是他的私人文学。"
          </p>
        </div>

        {/* 2. 用 Link 组件包裹 Button，实现无刷新跳转 */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/dashboard" passHref>
            <Button variant="default">进入看板</Button>
          </Link>
          <Link href="/works" passHref>
            <Button variant="outline">浏览书影</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
