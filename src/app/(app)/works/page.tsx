import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import WorksClientList from "@/components/WorksClientList";

type WorksListItem = ComponentProps<typeof WorksClientList>["initialItems"][number];

type RawWorkItem = Omit<WorksListItem, "canonical_works"> & {
  canonical_works?: WorksListItem["canonical_works"] | WorksListItem["canonical_works"][];
};

export default async function WorksPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: items } = await supabase
    .from("user_items")
    .select(
      `
      id,
      type,
      title,
      creator,
      year,
      rating,
      status,
      visibility,
      short_review,
      viewed_at,
      canonical_works ( canonical_id, title_zh, title_en )
    `,
    )
    .eq("user_id", session?.user.id)
    .order("viewed_at", { ascending: false });

  const normalizedItems = ((items || []) as RawWorkItem[]).map((item) => ({
    ...item,
    canonical_works: Array.isArray(item.canonical_works)
      ? item.canonical_works[0] || null
      : item.canonical_works || null,
  }));

  return (
    <div className="space-y-6">
      {/* 头部动作栏 */}
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的书影归档</h1>
          <p className="text-sm text-slate-500 mt-1">
            记录、复盘、封存属于你个人的精神自留地。
          </p>
        </div>
        <Link href="/works/new" prefetch={false} className="sm:shrink-0">
          <Button>+ 记录新书影</Button>
        </Link>
      </div>

      {/* 将海量数据下发给高级交互过滤器 */}
      <WorksClientList initialItems={normalizedItems} />
    </div>
  );
}
