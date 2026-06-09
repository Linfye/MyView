import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import WorksClientList from "@/components/WorksClientList"; // 引入我们即将抽离的高级客户端列表组件

export default async function WorksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 从数据库联合捞出当前用户的所有原始记录（包含绑定的公共库大写 ID）
  const { data: items } = await supabase
    .from("user_items")
    .select(
      `
      *,
      canonical_works ( canonical_id, title_zh, title_en )
    `,
    )
    .eq("user_id", user?.id)
    .order("viewed_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* 头部动作栏 */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的书影归档</h1>
          <p className="text-sm text-slate-500 mt-1">
            记录、复盘、封存属于你个人的精神自留地。
          </p>
        </div>
        <Link href="/works/new">
          <Button>+ 记录新书影</Button>
        </Link>
      </div>

      {/* 将海量数据下发给高级交互过滤器 */}
      <WorksClientList initialItems={items || []} />
    </div>
  );
}
