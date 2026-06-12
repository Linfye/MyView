"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { SelectMenu } from "@/components/ui/select-menu";
import { DatePartsSelector } from "@/components/ui/date-parts-selector";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Film,
  Globe2,
  ImagePlus,
  X,
} from "lucide-react";

type TimeMode = "now" | "custom";
type TimePrecision = "minute" | "day" | "month" | "year";
const MAX_POSTER_SIZE = 2 * 1024 * 1024;

function toLocalMinuteValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toLocalDateValue(date = new Date()) {
  return toLocalMinuteValue(date).slice(0, 10);
}

export default function NewWorkPage() {
  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("8");
  const [status, setStatus] = useState("completed");
  const [visibility, setVisibility] = useState("friends");
  const [shortReview, setShortReview] = useState("");
  const [longReview, setLongReview] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [canonicalId, setCanonicalId] = useState("");

  const [timeMode, setTimeMode] = useState<TimeMode>("now");
  const [timePrecision, setTimePrecision] = useState<TimePrecision>("day");
  const [customDate, setCustomDate] = useState(toLocalDateValue());
  const [customMonth, setCustomMonth] = useState(toLocalDateValue().slice(0, 7));
  const [customYear, setCustomYear] = useState(toLocalDateValue().slice(0, 4));

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { notify, NoticeHost } = useAnimatedNotice();
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
          titlePlaceholder: "如：星际穿越",
          creatorLabel: "导演 / 主创",
          creatorPlaceholder: "如：克里斯托弗·诺兰",
          yearLabel: "上映年份",
          posterLabel: "海报图片",
          posterHelp: "可选。支持常见图片格式，最大 2MB。",
          uploadImage: "上传海报",
          canonicalPlaceholder: "输入 IMDb ID (如: tt1375666)",
          canonicalHelp:
            "用于连接 IMDb 等电影公共库。如果该 ID 在公共库中不存在，系统将自动发起收录。",
          completed: "已看完",
          inProgress: "正在看",
          wishlist: "想看",
          timeLabel: "观看时间",
          shortLabel: "一句话短评",
          shortPlaceholder: "用一句话总结你的观影感受...",
          longLabel: "深度影评 (支持 Markdown)",
          longPlaceholder: "写下更详细的观影剖析...",
        }
      : {
          titleLabel: "书籍 / 文献名称",
          titlePlaceholder: "如：百年孤独",
          creatorLabel: "作者 / 编者",
          creatorPlaceholder: "如：加西亚·马尔克斯",
          yearLabel: "出版年份",
          posterLabel: "封面图片",
          posterHelp: "可选。支持常见图片格式，最大 2MB。",
          uploadImage: "上传封面",
          canonicalPlaceholder: "输入 Wikidata QID (如: Q13417184)",
          canonicalHelp:
            "用于连接 Wikidata 等书籍公共库。如果该 ID 在公共库中不存在，系统将自动发起收录。",
          completed: "已读完",
          inProgress: "正在读",
          wishlist: "想读",
          timeLabel: "阅读时间",
          shortLabel: "一句话短评",
          shortPlaceholder: "用一句话总结你的阅读感受...",
          longLabel: "读书笔记 (支持 Markdown)",
          longPlaceholder: "写下更详细的阅读笔记...",
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

  const uploadPoster = async (userId: string) => {
    if (!posterFile) return null;
    const ext = posterFile.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notify("登录状态已失效", "请重新登录后再保存。", "error");
      setLoading(false);
      return;
    }

    const finalizedTime =
      timeMode === "now"
        ? {
            viewedAt: toLocalMinuteValue(),
            precision: "minute" as TimePrecision,
          }
        : timePrecision === "year"
          ? {
              viewedAt: `${customYear || toLocalDateValue().slice(0, 4)}-01-01`,
              precision: "year" as TimePrecision,
            }
          : timePrecision === "month"
            ? {
                viewedAt: `${customMonth || toLocalDateValue().slice(0, 7)}-01`,
                precision: "month" as TimePrecision,
              }
            : {
                viewedAt: customDate || toLocalDateValue(),
                precision: "day" as TimePrecision,
              };

    let canonicalWorkId = null;

    if (canonicalId.trim()) {
      const cleanId = canonicalId.trim().toUpperCase();

      const { data: existingCanonical } = await supabase
        .from("canonical_works")
        .select("id")
        .eq("canonical_id", cleanId)
        .single();

      if (existingCanonical) {
        canonicalWorkId = existingCanonical.id;
      } else {
        const { data: newCanonical, error: canonicalError } = await supabase
          .from("canonical_works")
          .insert([
            {
              canonical_id: cleanId,
              type: type,
            },
          ])
          .select("id")
          .single();

        if (!canonicalError && newCanonical) {
          canonicalWorkId = newCanonical.id;
        }
      }
    }

    let posterUrl: string | null = null;
    try {
      posterUrl = await uploadPoster(user.id);
    } catch (error) {
      notify(
        "海报上传失败",
        error instanceof Error ? error.message : "请稍后重试。",
        "error",
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("user_items").insert([
      {
        user_id: user.id,
        canonical_work_id: canonicalWorkId,
        type,
        title,
        creator,
        year: year ? parseInt(year) : null,
        rating: parseFloat(rating),
        status,
        visibility,
        short_review: shortReview,
        long_review: longReview,
        poster_url: posterUrl,
        viewed_at: finalizedTime.viewedAt,
        time_precision: finalizedTime.precision,
      },
    ]);

    if (error) {
      notify("保存失败", error.message, "error");
      setLoading(false);
      return;
    }

    notify("已归档", "这条文化记忆已经保存。", "success");
    window.setTimeout(() => {
      router.push("/works");
      router.refresh();
    }, 520);
  };

  return (
    <div className="max-w-3xl mx-auto app-surface p-5 rounded-2xl sm:p-8">
      <NoticeHost />
      <h1 className="text-xl font-bold text-slate-900">添加新纪录</h1>
      <p className="text-sm text-slate-500 mt-1">归档你的文化足迹。</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-semibold text-slate-500 block mb-2">
            分类
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${type === "movie" ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-800"}`}
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${type === "book" ? "bg-teal-700 text-white border-teal-700" : "bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-800"}`}
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

        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 space-y-2">
          <label className="text-sm font-bold text-teal-900 flex items-center gap-1.5">
            <Globe2 className="size-3.5" />
            链接权威公共库{" "}
            <span className="font-normal text-teal-700/70">(选填)</span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono outline-none transition-colors focus:border-teal-500"
            placeholder={copy.canonicalPlaceholder}
            value={canonicalId}
            onChange={(e) => setCanonicalId(e.target.value)}
          />
          <p className="text-sm text-teal-800/75 leading-6">
            {copy.canonicalHelp}
          </p>
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
              placeholder={copy.titlePlaceholder}
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
              placeholder={copy.creatorPlaceholder}
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
            {posterPreview ? (
              <div className="relative w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterPreview}
                  alt="海报预览"
                  className="h-40 w-28 rounded-xl border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-white text-slate-500 shadow hover:text-red-500"
                  onClick={() => {
                    setPosterFile(null);
                    setPosterPreview("");
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
              placeholder="如：2014"
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

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">
              {copy.timeLabel}
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  timeMode === "now"
                    ? "border-teal-200 bg-white text-teal-800 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-white"
                }`}
                onClick={() => setTimeMode("now")}
              >
                <Clock3 className="size-4" />
                当前标记时间
                <span className="ml-auto text-xs font-normal text-slate-400">
                  到分钟
                </span>
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  timeMode === "custom"
                    ? "border-teal-200 bg-white text-teal-800 shadow-sm"
                    : "border-transparent text-slate-500 hover:bg-white"
                }`}
                onClick={() => {
                  setTimeMode("custom");
                  setTimePrecision((current) =>
                    current === "minute" ? "day" : current,
                  );
                }}
              >
                <CalendarDays className="size-4" />
                自定义时间
              </button>
            </div>
          </div>

          {timeMode === "custom" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  自定义精度
                </label>
                <div className="flex gap-2 mt-2">
                  {(["day", "month", "year"] as TimePrecision[]).map((p) => (
                <button
                  key={p}
                  type="button"
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${timePrecision === p ? "bg-white text-teal-800 border-teal-200 shadow-sm" : "bg-transparent text-slate-500 border-transparent hover:bg-white"}`}
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
                <label className="text-sm font-semibold text-slate-600 block mb-2">
                  选择时间
                </label>
                <DatePartsSelector
                  precision={timePrecision === "minute" ? "day" : timePrecision}
                  value={
                    timePrecision === "year"
                      ? customYear
                      : timePrecision === "month"
                        ? customMonth
                        : customDate
                  }
                  onChange={(next) => {
                    if (timePrecision === "year") setCustomYear(next);
                    else if (timePrecision === "month") setCustomMonth(next);
                    else setCustomDate(next);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            {copy.shortLabel}
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder={copy.shortPlaceholder}
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
            placeholder={copy.longPlaceholder}
            value={longReview}
            onChange={(e) => setLongReview(e.target.value)}
          />
        </div>

        <div className="flex gap-4 justify-end border-t pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "正在保存..." : "归档存储"}
          </Button>
        </div>
      </form>
    </div>
  );
}
