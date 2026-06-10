import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Film, LockKeyhole, Pencil, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type CanonicalWork =
  | {
      canonical_id?: string;
      title_zh?: string;
      title_en?: string;
    }
  | null;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

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
      status,
      visibility,
      short_review,
      long_review,
      viewed_at,
      time_precision,
      canonical_works ( canonical_id, title_zh, title_en )
    `,
    )
    .eq("id", id)
    .eq("user_id", session?.user.id)
    .single();

  if (!data) notFound();

  const canonical = Array.isArray(data.canonical_works)
    ? (data.canonical_works[0] as CanonicalWork)
    : (data.canonical_works as CanonicalWork);
  const title = canonical?.title_zh || data.title;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/works"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="size-4" />
          返回归档
        </Link>
        <Link href={`/works/${id}/edit`} prefetch={false}>
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            编辑
          </Button>
        </Link>
      </div>

      <article className="app-surface rounded-2xl p-7">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="meta-pill gap-1">
            {data.type === "movie" ? (
              <Film className="size-3.5" />
            ) : (
              <BookOpen className="size-3.5" />
            )}
            {data.type === "movie" ? "电影 / 剧集" : "图书 / 文献"}
          </span>
          <span className="meta-pill gap-1">
            {data.visibility === "private" ? (
              <LockKeyhole className="size-3.5" />
            ) : (
              <Users className="size-3.5" />
            )}
            {data.visibility === "private" ? "私人可见" : "密友可见"}
          </span>
          {canonical?.canonical_id && (
            <code className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
              {canonical.canonical_id}
            </code>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
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
  );
}
