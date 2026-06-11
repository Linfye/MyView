"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { BookOpen, CalendarDays, Clock3, Film, Globe2 } from "lucide-react";

type TimeMode = "now" | "custom";
type TimePrecision = "minute" | "day" | "month" | "year";

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
            placeholder={
              type === "movie"
                ? "输入 IMDb ID (如: tt1375666)"
                : "输入 Wikidata QID (如: Q13417184)"
            }
            value={canonicalId}
            onChange={(e) => setCanonicalId(e.target.value)}
          />
          <p className="text-sm text-teal-800/75 leading-6">
            系统会保存为大写字母。如果该 ID
            在公共库中不存在，系统将自动发起收录，由管理员后续补全其多语言元数据。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">
              作品名称
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如：星际穿越"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              导演 / 作者
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如：诺兰"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              出版/上映年份
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
            <select
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i}>
                  {i} 分{" "}
                  {i === 10
                    ? "神作"
                    : i >= 8
                      ? "杰作"
                      : i >= 6
                        ? "及格"
                        : "糟糕"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              记录状态
            </label>
            <select
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="completed">已看完</option>
              <option value="in_progress">正处于</option>
              <option value="wishlist">想看/想读</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              隐私控制
            </label>
            <select
              className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="friends">公开展示</option>
              <option value="private">仅自己可见</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">
              记录时间
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
                {timePrecision === "year" ? (
                  <input
                    type="number"
                    className="w-full field-control"
                    min="0"
                    max="9999"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                  />
                ) : timePrecision === "month" ? (
                  <input
                    type="month"
                    className="w-full field-control"
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                  />
                ) : (
                  <input
                    type="date"
                    className="w-full field-control"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            一句话短评
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder="用一句话总结你的核心感受..."
            value={shortReview}
            onChange={(e) => setShortReview(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            深度长评 (支持 Markdown)
          </label>
          <textarea
            rows={5}
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder="写下更详细的剖析..."
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
