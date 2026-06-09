import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. 基础数据拉取
  const { count: movieCount } = await supabase
    .from("user_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("type", "movie");
  const { count: bookCount } = await supabase
    .from("user_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("type", "book");

  // 拉取用户的全量数据用于本地高性能数学统计
  const { data: allItems } = await supabase
    .from("user_items")
    .select("rating, viewed_at")
    .eq("user_id", user?.id);

  const totalCount = allItems?.length || 0;

  // 2. 统计【评分分布】 (0 - 10分)
  const ratingMap: { [key: number]: number } = {};
  for (let i = 0; i <= 10; i++) ratingMap[i] = 0;
  allItems?.forEach((item) => {
    if (item.rating !== null && item.rating !== undefined) {
      const r = Math.round(item.rating);
      if (ratingMap[r] !== undefined) ratingMap[r]++;
    }
  });

  // 3. 统计【时间分布】（按年月聚合 YYYY-MM）
  const timelineMap: { [key: string]: number } = {};
  allItems?.forEach((item) => {
    if (item.viewed_at) {
      const dateObj = new Date(item.viewed_at);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;
      timelineMap[key] = (timelineMap[key] || 0) + 1;
    }
  });
  // 将时间轴按时间先后顺序合理排序，并只取最近的 6 个月进行优美排版展示
  const sortedTimeline = Object.keys(timelineMap)
    .sort()
    .slice(-6)
    .map((key) => ({ label: key, count: timelineMap[key] }));

  // 计算时间图表的最大值用于按比例计算柱子高度
  const maxTimeCount = Math.max(...sortedTimeline.map((t) => t.count), 1);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          数据统计
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          全方位复盘你的精神足迹与文化偏好。
        </p>
      </div>

      {/* 基础统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-2xl">🎬</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
              已看电影 / 剧集
            </p>
          </div>
          <p className="text-4xl font-black mt-4 text-slate-800">
            {movieCount || 0}{" "}
            <span className="text-sm font-normal text-slate-400">部</span>
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-2xl">📚</span>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
              已读图书 / 文献
            </p>
          </div>
          <p className="text-4xl font-black mt-4 text-slate-800">
            {bookCount || 0}{" "}
            <span className="text-sm font-normal text-slate-400">本</span>
          </p>
        </div>
      </div>

      {/* 下方统计图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 图表 1：评分数量与比例统计（横向柱状比例图） */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            ⭐ 评分分布与比例
          </h3>
          <p className="text-xs text-slate-400 mb-6">统计各个分数的数量占比</p>

          <div className="space-y-3.5">
            {Object.keys(ratingMap)
              .reverse()
              .map((ratingStr) => {
                const r = parseInt(ratingStr);
                const count = ratingMap[r];
                const percentage =
                  totalCount > 0 ? (count / totalCount) * 100 : 0;

                return (
                  <div key={r} className="flex items-center gap-3 text-xs">
                    <div className="w-12 text-slate-500 font-medium text-right">
                      {r} 分
                    </div>
                    <div className="flex-1 bg-slate-50 h-5 rounded-full overflow-hidden relative border border-slate-100">
                      {count > 0 && (
                        <div
                          className="bg-slate-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                    </div>
                    <div className="w-16 text-slate-400 text-right">
                      <span className="font-semibold text-slate-700">
                        {count}
                      </span>{" "}
                      ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 图表 2：时间维度统计（纵向经典柱状图） */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              📅 归档动态趋势
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              按年月统计看过的电影与图书总量趋势（近6个月）
            </p>
          </div>

          {sortedTimeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-300 border border-dashed rounded-xl bg-slate-50/50">
              暂无时间分布数据
            </div>
          ) : (
            /* 纵向对齐柱状图底座 */
            <div className="flex items-end justify-between gap-2 px-4 h-64 border-b border-slate-200 pb-2">
              {sortedTimeline.map((data, index) => {
                const heightPercent = (data.count / maxTimeCount) * 80; // 留出顶部空间显示数字
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    {/* 柱状条顶部的具体数字 */}
                    <span className="text-[10px] font-bold text-slate-700 opacity-80">
                      {data.count} 部/本
                    </span>
                    {/* 柱子主体 */}
                    <div
                      className="w-full bg-slate-900/90 rounded-t-lg group-hover:bg-slate-900 transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 4)}%` }} // 确保就算数据为0也有个小底座
                    />
                    {/* X轴刻度 */}
                    <span className="text-[10px] text-slate-400 font-medium mt-1 whitespace-nowrap">
                      {data.label.split("-")[1]}月 (
                      {data.label.split("-")[0].slice(2)}年)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
