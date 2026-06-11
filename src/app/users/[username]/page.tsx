import type { ComponentProps } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, AtSign, LogIn, UserPlus } from "lucide-react";
import WorksClientList from "@/components/WorksClientList";
import { createClient } from "@/lib/supabase/server";

type WorksListItem = ComponentProps<typeof WorksClientList>["initialItems"][number];
type RawWorkItem = Omit<WorksListItem, "canonical_works"> & {
  canonical_works?: WorksListItem["canonical_works"] | WorksListItem["canonical_works"][];
};

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) notFound();

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
    .eq("user_id", profile.id)
    .eq("visibility", "friends")
    .order("viewed_at", { ascending: false });

  const normalizedItems = ((items || []) as RawWorkItem[]).map((item) => ({
    ...item,
    canonical_works: Array.isArray(item.canonical_works)
      ? item.canonical_works[0] || null
      : item.canonical_works || null,
  }));
  const displayName = profile.display_name || profile.username;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.10),transparent_28rem),linear-gradient(180deg,#f8fafc,#eef2f7)] px-4 py-6">
      <section className="mx-auto max-w-screen-2xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-xl font-black text-white shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  {displayName} 的书影归档
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-base font-mono text-slate-500">
                  <AtSign className="size-4" />
                  {profile.username}
                </p>
                {profile.bio && (
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 lg:w-80">
              <p className="text-sm font-semibold text-teal-900">
                也想建立自己的书影归档？
              </p>
              <p className="mt-1 text-sm leading-6 text-teal-800/75">
                注册 MyView，记录评分、短评、长评和你的文化时间线。
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
                >
                  <UserPlus className="size-4" />
                  免费注册
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50"
                >
                  <LogIn className="size-4" />
                  已有账号登录
                </Link>
              </div>
            </div>
          </div>
        </header>

        <WorksClientList
          initialItems={normalizedItems}
          readOnly
          detailBasePath={`/users/${profile.username}/works`}
        />
      </section>
    </main>
  );
}
