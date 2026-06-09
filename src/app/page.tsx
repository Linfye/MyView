export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          MyView
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          欢迎来到您的私密书影自留地。记录记忆，同频共振。
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <a
            href="/login"
            className="w-full bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition-colors block"
          >
            进入系统
          </a>
        </div>
      </div>
    </div>
  );
}
