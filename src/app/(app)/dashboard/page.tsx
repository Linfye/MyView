import { createClient } from "@/lib/supabase/server";
import DashboardTrendCharts from "@/components/DashboardTrendCharts";

type DashboardItem = {
  type: string | null;
  rating: number | null;
  year: number | null;
  viewed_at: string | null;
};

async function fetchAllDashboardItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId?: string,
) {
  const pageSize = 1000;
  const items: DashboardItem[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("user_items")
      .select("type, rating, year, viewed_at")
      .eq("user_id", userId)
      .range(from, from + pageSize - 1);

    if (error) return items;
    items.push(...((data || []) as DashboardItem[]));
    if (!data || data.length < pageSize) return items;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const allItems = await fetchAllDashboardItems(supabase, session?.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-1 sm:space-y-10 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          数据统计
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          全方位复盘你的精神足迹与文化偏好。
        </p>
      </div>

      <DashboardTrendCharts items={allItems} />
    </div>
  );
}
