import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
      <p className="mt-2 text-slate-500">
        欢迎来到你的私人文化记忆中心，这里将统计你的书影数据。
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">已读图书</p>
          <p className="text-3xl font-bold mt-1 text-slate-800">0 本</p>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">已看电影</p>
          <p className="text-3xl font-bold mt-1 text-slate-800">0 部</p>
        </div>
      </div>
    </div>
  );
}
