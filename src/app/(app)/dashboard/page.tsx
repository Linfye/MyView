import { createClient } from "@/lib/supabase/server";
import DashboardTrendCharts from "@/components/DashboardTrendCharts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: allItems } = await supabase
    .from("user_items")
    .select("type, rating, year")
    .eq("user_id", session?.user.id);

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

      <DashboardTrendCharts items={allItems || []} />
    </div>
  );
}
