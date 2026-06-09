"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function NewWorkPage() {
  const [type, setType] = useState("movie"); // 'movie' 或 'book'
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("8");
  const [status, setStatus] = useState("completed");
  const [visibility, setVisibility] = useState("friends");
  const [shortReview, setShortReview] = useState("");
  const [longReview, setLongReview] = useState("");

  // 核心升级：通用权威 ID 状态
  const [canonicalId, setCanonicalId] = useState("");

  const [timePrecision, setTimePrecision] = useState("day");
  const [viewedDate, setViewedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let finalizedDate = viewedDate;
    if (timePrecision === "year") {
      finalizedDate = `${viewedDate.split("-")[0]}-01-01`;
    } else if (timePrecision === "month") {
      const parts = viewedDate.split("-");
      finalizedDate = `${parts[0]}-${parts[1]}-01`;
    }

    // --- 核心逻辑：权威 ID 查重与仅入库 ID ---
    let canonicalWorkId = null;

    if (canonicalId.trim()) {
      // 1. 强制转换为纯大写字母
      const cleanId = canonicalId.trim().toUpperCase();

      // 2. 查重
      const { data: existingCanonical } = await supabase
        .from("canonical_works")
        .select("id")
        .eq("canonical_id", cleanId)
        .single();

      if (existingCanonical) {
        canonicalWorkId = existingCanonical.id;
      } else {
        // 3. 如果不存在，只添加大写 ID 和类型，其余留给 Admin 补充
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
    // ----------------------------------------

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
        viewed_at: finalizedDate,
        time_precision: timePrecision,
      },
    ]);

    if (error) {
      alert("保存失败：" + error.message);
      setLoading(false);
      return;
    }

    router.push("/works");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">添加新纪录</h1>
      <p className="text-sm text-slate-500 mt-1">归档你的文化足迹。</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-2">
            分类
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${type === "movie" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
              onClick={() => {
                setType("movie");
                setCanonicalId("");
              }}
            >
              🎬 电影 / 剧集
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${type === "book" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
              onClick={() => {
                setType("book");
                setCanonicalId("");
              }}
            >
              📚 图书 / 文献
            </button>
          </div>
        </div>

        {/* 动态权威 ID 输入框 */}
        <div className="p-4 bg-slate-950 rounded-xl text-white space-y-2 shadow-inner">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            🌐 链接权威公共库{" "}
            <span className="font-normal text-slate-500">(选填)</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 text-white border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-slate-500 placeholder-slate-600 font-mono"
            placeholder={
              type === "movie"
                ? "输入 IMDb ID (如: tt1375666)"
                : "输入 Wikidata QID (如: Q13417184)"
            }
            value={canonicalId}
            onChange={(e) => setCanonicalId(e.target.value)}
          />
          <p className="text-[10px] text-slate-500 leading-normal">
            系统将强制保存为**大写字母**。如果该 ID
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
                    ? "👑 神作"
                    : i >= 8
                      ? "🔥 杰作"
                      : i >= 6
                        ? "👌 及格"
                        : "🗑️ 糟糕"}
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
              <option value="friends">👥 仅密友可见</option>
              <option value="private">🔒 仅自己可见</option>
            </select>
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
            <input
              type="date"
              className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-none focus:border-slate-400 h-[38px]"
              value={viewedDate}
              onChange={(e) => setViewedDate(e.target.value)}
            />
          </div>
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
