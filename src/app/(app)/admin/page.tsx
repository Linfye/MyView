import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. 获取当前登录用户
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. 直接去数据库核对这个人的 profiles 里 is_admin 到底是不是 true
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // 🚨 【数据库级别防御】如果这个人在表里对应的 is_admin 不是 true，立刻无情弹走！
  if (!profile || !profile.is_admin) {
    redirect("/");
  }

  // 3. 验证通过的硬核管理员，准许调取主库条目
  const { data: canonicalList } = await supabase
    .from("canonical_works")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          👑 公共库维护后台
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          管理员专属。在这里补充、校对由用户自发扩容触发的全球权威 ID 词条。
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="grid grid-cols-4 w-full gap-4">
            <div>权威 ID / 分类</div>
            <div className="col-span-2">当前元数据状态</div>
            <div className="text-right">操作</div>
          </div>
        </div>

        {!canonicalList || canonicalList.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            当前权威公共库没有任何条目。
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {canonicalList.map((work) => {
              const isPending = !work.title_zh && !work.title_en;

              return (
                <div
                  key={work.id}
                  className="p-4 flex justify-between items-center text-sm hover:bg-slate-50/50 transition-colors"
                >
                  <div className="grid grid-cols-4 w-full gap-4 items-center">
                    <div className="space-y-1">
                      <code className="text-xs font-bold font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 block w-max">
                        {work.canonical_id}
                      </code>
                      <span className="text-xs text-slate-400">
                        {work.type === "movie" ? "🎬 电影" : "📚 图书"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          ⏳ 待补充元数据 (壳词条)
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">
                            {work.title_zh || work.title_en || "未命名"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {work.creator_name ? `${work.creator_name} · ` : ""}
                            {work.first_published_year
                              ? `${work.first_published_year}年`
                              : ""}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <Link href={`/admin/${work.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                        >
                          {isPending ? "录入元数据" : "修改校对"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
