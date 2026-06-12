import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Film, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type CanonicalWork =
  | {
      canonical_id?: string;
      title_zh?: string;
      title_en?: string;
    }
  | null;

export default async function PublicWorkDetailPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) notFound();

  const { data } = await supabase
    .from("user_items")
    .select(
      `
      id,
      type,
      title,
      creator,
      year,
      rating,
      short_review,
      long_review,
      poster_url,
      viewed_at,
      canonical_works ( canonical_id, title_zh, title_en )
    `,
    )
    .eq("id", id)
    .eq("user_id", profile.id)
    .eq("visibility", "friends")
    .single();

  if (!data) notFound();

  const canonical = Array.isArray(data.canonical_works)
    ? (data.canonical_works[0] as CanonicalWork)
    : (data.canonical_works as CanonicalWork);
  const title = canonical?.title_zh || data.title;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#eef2f7)] px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link
          href={`/users/${profile.username}`}
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="size-4" />
          返回 {profile.display_name || profile.username} 的归档
        </Link>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="meta-pill gap-1">
              {data.type === "movie" ? (
                <Film className="size-3.5" />
              ) : (
                <BookOpen className="size-3.5" />
              )}
              {data.type === "movie" ? "电影 / 剧集" : "图书 / 文献"}
            </span>
            {canonical?.canonical_id && (
              <code className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
                {canonical.canonical_id}
              </code>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row">
            {data.poster_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.poster_url}
                alt=""
                className="h-64 w-44 shrink-0 rounded-2xl border border-slate-200 object-cover bg-slate-100"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{data.creator || "未知主创"}</span>
                {data.year && <span>{data.year}</span>}
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  {data.rating} / 10
                </span>
              </div>
            </div>
          </div>

          {data.short_review && (
            <p className="mt-6 rounded-xl border-l-4 border-teal-600 bg-teal-50/70 p-4 text-base font-medium leading-7 text-slate-800">
              {data.short_review}
            </p>
          )}

          <section className="mt-7 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-500">深度长评</h2>
            {data.long_review ? (
              <div className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {data.long_review}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">暂未记录长评。</p>
            )}
          </section>
        </article>
      </div>
    </main>
  );
}
