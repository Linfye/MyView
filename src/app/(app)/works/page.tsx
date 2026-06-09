import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function WorksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 从数据库捞出当前用户的所有记录（按记录中选择的 viewed_at 时间倒序排列）
  const { data: items } = await supabase
    .from("user_items")
    .select("*")
    .eq("user_id", user?.id)
    .order("viewed_at", { ascending: false });

  return (
    <div>
      {/* 头部动作栏 */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的书影归档</h1>
          <p className="text-sm text-slate-500 mt-1">
            这里收藏着你所有的文化记忆碎片。
          </p>
        </div>
        <Link href="/works/new">
          <Button>+ 记录新书影</Button>
        </Link>
      </div>

      {/* 数据列表渲染 */}
      {!items || items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-white">
          <p className="text-sm text-slate-400">
            还没有任何归档，点击右上角按钮开启第一条记忆。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                      {item.type === "movie" ? "🎬 电影" : "📚 图书"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                      {item.status === "completed"
                        ? "已看完"
                        : item.status === "in_progress"
                          ? "正处于"
                          : "想看"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.visibility === "private"
                        ? "🔒 私人"
                        : "👥 密友可见"}
                    </span>
                  </div>

                  {/* 编辑按钮 */}
                  <Link href={`/works/${item.id}/edit`}>
                    <span className="text-xs text-slate-400 hover:text-slate-900 cursor-pointer border rounded px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                      编辑
                    </span>
                  </Link>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-bold text-slate-900 mt-3 flex items-baseline gap-2">
                  {item.title}
                  {item.year && (
                    <span className="text-sm font-normal text-slate-400">
                      ({item.year})
                    </span>
                  )}
                </h3>

                {item.creator && (
                  <p className="text-xs text-slate-500 mt-1">
                    作者/导演：{item.creator}
                  </p>
                )}

                {/* 10 分制评分展示 */}
                <div className="flex items-center gap-1.5 mt-2 bg-amber-50/60 border border-amber-100/50 w-max px-2 py-0.5 rounded-lg">
                  <span className="text-amber-500 text-xs">⭐</span>
                  <span className="text-xs font-bold text-amber-700">
                    {item.rating} / 10
                  </span>
                </div>

                {/* 短评展示 */}
                {item.short_review && (
                  <p className="text-sm font-medium text-slate-800 mt-3 border-l-2 border-slate-300 pl-2">
                    {item.short_review}
                  </p>
                )}

                {/* 长评展示 */}
                {item.long_review && (
                  <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-4 italic">
                    "{item.long_review}"
                  </p>
                )}
              </div>

              {/* 智能精度时间渲染 */}
              <div className="text-right mt-4 pt-2 border-t border-slate-50">
                <span className="text-[10px] text-slate-400">
                  标记于{" "}
                  {item.time_precision === "year"
                    ? `${new Date(item.viewed_at).getFullYear()} 年`
                    : item.time_precision === "month"
                      ? `${new Date(item.viewed_at).getFullYear()} 年 ${new Date(item.viewed_at).getMonth() + 1} 月`
                      : new Date(item.viewed_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
