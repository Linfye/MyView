export default function WorksPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">我的书影归档</h1>
      <p className="mt-2 text-slate-500">这里会展示你记录过的所有作品。</p>

      {/* 这是一个占位用的空状态 */}
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-slate-500">
          暂无记录，开启你的第一条文化记忆吧。
        </p>
      </div>
    </div>
  );
}
