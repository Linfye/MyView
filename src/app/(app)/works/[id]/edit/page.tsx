"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { SelectMenu } from "@/components/ui/select-menu";
import { DatePartsSelector } from "@/components/ui/date-parts-selector";
import { BookOpen, Film, Globe2, ImagePlus, Trash2, X } from "lucide-react";

const MAX_POSTER_SIZE = 2 * 1024 * 1024;

export default function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("8");
  const [status, setStatus] = useState("completed");
  const [visibility, setVisibility] = useState("friends");
  const [shortReview, setShortReview] = useState("");
  const [longReview, setLongReview] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");

  // 升级：编辑状态下的权威 ID 字段
  const [canonicalId, setCanonicalId] = useState("");
  const [oldCanonicalWorkId, setOldCanonicalWorkId] = useState<string | null>(
    null,
  );

  const [timePrecision, setTimePrecision] = useState("day");
  const [viewedDate, setViewedDate] = useState("");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { notify, confirm, NoticeHost } = useAnimatedNotice();
  const ratingOptions = Array.from({ length: 11 }, (_, i) => ({
    value: String(i),
    label: `${i} 分`,
  }));
  const visibilityOptions = [
    { value: "friends", label: "公开展示" },
    { value: "private", label: "仅自己可见" },
  ];
  const copy =
    type === "movie"
      ? {
          titleLabel: "电影 / 剧集名称",
          creatorLabel: "导演 / 主创",
          yearLabel: "上映年份",
          posterLabel: "海报图片",
          posterHelp: "可选。支持常见图片格式，最大 2MB。",
          uploadImage: "上传海报",
          canonicalPlaceholder: "编辑 IMDb ID (如: TT1375666)",
          completed: "已看完",
          inProgress: "正在看",
          wishlist: "想看",
          shortLabel: "一句话短评",
          longLabel: "深度影评 (支持 Markdown)",
        }
      : {
          titleLabel: "书籍 / 文献名称",
          creatorLabel: "作者 / 编者",
          yearLabel: "出版年份",
          posterLabel: "封面图片",
          posterHelp: "可选。支持常见图片格式，最大 2MB。",
          uploadImage: "上传封面",
          canonicalPlaceholder: "编辑 Wikidata QID (如: Q13417184)",
          completed: "已读完",
          inProgress: "正在读",
          wishlist: "想读",
          shortLabel: "一句话短评",
          longLabel: "读书笔记 (支持 Markdown)",
        };

  const handlePosterChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("图片格式不支持", "请上传 JPG、PNG、WebP 等图片文件。", "error");
      return;
    }
    if (file.size > MAX_POSTER_SIZE) {
      notify("图片太大", "海报图片不能超过 2MB。", "error");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const uploadPoster = async () => {
    if (!posterFile) return posterUrl || null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("登录状态已失效");
    const ext = posterFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("posters")
      .upload(path, posterFile, {
        cacheControl: "31536000",
        contentType: posterFile.type,
      });
    if (error) throw error;
    const { data } = supabase.storage.from("posters").getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    async function fetchItem() {
      // 1. 联合查询，顺便把已绑定的公共库里的真实大写 ID 捞出来
      const { data, error } = await supabase
        .from("user_items")
        .select(
          `
          *,
          canonical_works ( canonical_id )
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        notify("获取数据失败", error.message, "error");
        router.push("/works");
        return;
      }
      if (data) {
        setType(data.type);
        setTitle(data.title);
        setCreator(data.creator || "");
        setYear(data.year ? data.year.toString() : "");
        setRating(data.rating.toString());
        setStatus(data.status);
        setVisibility(data.visibility);
        setShortReview(data.short_review || "");
        setLongReview(data.long_review || "");
        setPosterUrl(data.poster_url || "");
        setTimePrecision(data.time_precision || "day");
        setViewedDate((data.viewed_at || "").slice(0, 10));

        setOldCanonicalWorkId(data.canonical_work_id);
        // 如果之前绑定过，直接把那个大写的 ID 填入框里回显出来
        if (data.canonical_works) {
          const cw = data.canonical_works as unknown as {
            canonical_id?: string;
          };
          setCanonicalId(cw?.canonical_id || "");
        }
      }
      setFetching(false);
    }
    fetchItem();
  }, [id, supabase, router, notify]);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "删除这条归档？",
      message: `确定要彻底删除《${title}》的记忆档案吗？此操作不可撤销。`,
      confirmText: "删除",
      dangerous: true,
    });
    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase.from("user_items").delete().eq("id", id);

    if (error) {
      notify("删除失败", error.message, "error");
      setDeleting(false);
      return;
    }

    notify("已删除", "这条归档已移除。", "success");
    window.setTimeout(() => {
      router.push("/works");
      router.refresh();
    }, 520);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || deleting) return;
    setLoading(true);

    let finalizedDate = viewedDate;
    if (timePrecision === "year") {
      finalizedDate = `${viewedDate.split("-")[0]}-01-01`;
    } else if (timePrecision === "month") {
      const parts = viewedDate.split("-");
      finalizedDate = `${parts[0]}-${parts[1]}-01`;
    }

    // --- 核心逻辑：编辑时的权威 ID 重新洗牌与校验 ---
    let currentCanonicalWorkId = oldCanonicalWorkId;

    if (canonicalId.trim()) {
      const cleanId = canonicalId.trim().toUpperCase(); // 强制大写

      const { data: existingCanonical } = await supabase
        .from("canonical_works")
        .select("id")
        .eq("canonical_id", cleanId)
        .single();

      if (existingCanonical) {
        currentCanonicalWorkId = existingCanonical.id;
      } else {
        // 如果改出了一个新的库里没有的 ID，依然干净入库，等 Admin 补全
        const { data: newCanonical, error: canonicalError } = await supabase
          .from("canonical_works")
          .insert([{ canonical_id: cleanId, type: type }])
          .select("id")
          .single();

        if (!canonicalError && newCanonical) {
          currentCanonicalWorkId = newCanonical.id;
        }
      }
    } else {
      // 如果用户把框里清空了，说明想解除绑定
      currentCanonicalWorkId = null;
    }
    // ------------------------------------------------

    let nextPosterUrl: string | null = posterUrl || null;
    try {
      nextPosterUrl = await uploadPoster();
    } catch (error) {
      notify(
        "海报上传失败",
        error instanceof Error ? error.message : "请稍后重试。",
        "error",
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("user_items")
      .update({
        type,
        title,
        creator,
        year: year ? parseInt(year) : null,
        rating: parseFloat(rating),
        status,
        visibility,
        short_review: shortReview,
        long_review: longReview,
        poster_url: nextPosterUrl,
        viewed_at: finalizedDate,
        time_precision: timePrecision,
        canonical_work_id: currentCanonicalWorkId, // 更新绑定
      })
      .eq("id", id);

    if (error) {
      notify("更新失败", error.message, "error");
      setLoading(false);
      return;
    }

    notify("已更新", "归档记录已经保存。", "success");
    window.setTimeout(() => {
      router.push("/works");
      router.refresh();
    }, 520);
  };

  if (fetching)
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        正在读取原归档数据...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto app-surface p-8 rounded-2xl relative">
      <NoticeHost />
      <div className="absolute top-8 right-8">
        <Button
          type="button"
          variant="ghost"
          disabled={loading || deleting}
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors h-8 rounded-lg px-3"
        >
          {deleting ? (
            "正在删除..."
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="size-3.5" />
              删除此记录
            </span>
          )}
        </Button>
      </div>

      <h1 className="text-xl font-bold text-slate-900">编辑归档记录</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-[75%]">
        正在修改《{title}》的记忆档案。
      </p>

      <form onSubmit={handleUpdate} className="mt-6 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-2">
            分类
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${type === "movie" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              onClick={() => {
                setType("movie");
                setCanonicalId("");
              }}
            >
              <Film className="size-4" />
              电影 / 剧集
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${type === "book" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
              onClick={() => {
                setType("book");
                setCanonicalId("");
              }}
            >
              <BookOpen className="size-4" />
              图书 / 文献
            </button>
          </div>
        </div>

        {/* 编辑状态下的动态权威 ID 框 */}
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 space-y-2">
          <label className="text-sm font-bold text-teal-900 flex items-center gap-1.5">
            <Globe2 className="size-3.5" />
            链接权威公共库{" "}
            <span className="font-normal text-teal-700/70">
              (选填/可编辑修改)
            </span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono outline-none transition-colors focus:border-teal-500"
            placeholder={copy.canonicalPlaceholder}
            value={canonicalId}
            onChange={(e) => setCanonicalId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">
              {copy.titleLabel}
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              {copy.creatorLabel}
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="text-sm font-semibold text-slate-600">
            {copy.posterLabel}
          </label>
          <p className="mt-1 text-sm text-slate-400">
            {copy.posterHelp}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            {posterPreview || posterUrl ? (
              <div className="relative w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterPreview || posterUrl}
                  alt="海报预览"
                  className="h-40 w-28 rounded-xl border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-white text-slate-500 shadow hover:text-red-500"
                  onClick={() => {
                    setPosterFile(null);
                    setPosterPreview("");
                    setPosterUrl("");
                  }}
                  aria-label="移除海报"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 sm:w-44">
                <ImagePlus className="mb-2 size-6" />
                {copy.uploadImage}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handlePosterChange(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              {copy.yearLabel}
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              我的评分 (10分制)
            </label>
            <SelectMenu
              value={rating}
              onValueChange={setRating}
              options={ratingOptions}
              className="mt-1"
              ariaLabel="选择评分"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              记录状态
            </label>
            <SelectMenu
              value={status}
              onValueChange={setStatus}
              options={[
                { value: "completed", label: copy.completed },
                { value: "in_progress", label: copy.inProgress },
                { value: "wishlist", label: copy.wishlist },
              ]}
              className="mt-1"
              ariaLabel="选择记录状态"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              隐私控制
            </label>
            <SelectMenu
              value={visibility}
              onValueChange={setVisibility}
              options={visibilityOptions}
              className="mt-1"
              ariaLabel="选择隐私控制"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              时间记录精度
            </label>
            <div className="flex gap-2 mt-1">
              {["day", "month", "year"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${timePrecision === p ? "bg-white text-slate-900 border-slate-300 shadow-sm" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-200/50"}`}
                  onClick={() => setTimePrecision(p)}
                >
                  {p === "day"
                    ? "精确到天"
                    : p === "month"
                      ? "仅记年月"
                      : "仅记年份"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              选择时间
            </label>
            <DatePartsSelector
              precision={timePrecision === "year" ? "year" : timePrecision === "month" ? "month" : "day"}
              value={
                timePrecision === "year"
                  ? viewedDate.slice(0, 4)
                  : timePrecision === "month"
                    ? viewedDate.slice(0, 7)
                    : viewedDate
              }
              onChange={(next) => {
                if (timePrecision === "year") setViewedDate(`${next}-01-01`);
                else if (timePrecision === "month") setViewedDate(`${next}-01`);
                else setViewedDate(next);
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            {copy.shortLabel}
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            value={shortReview}
            onChange={(e) => setShortReview(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            {copy.longLabel}
          </label>
          <textarea
            rows={5}
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            value={longReview}
            onChange={(e) => setLongReview(e.target.value)}
          />
        </div>

        <div className="flex gap-4 justify-end border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading || deleting}
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading || deleting}>
            {loading ? "保存修改..." : "更新归档"}
          </Button>
        </div>
      </form>
    </div>
  );
}
