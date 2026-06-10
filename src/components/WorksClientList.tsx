"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, Film, LockKeyhole, PenLine, Star, Users } from "lucide-react";

interface WorkItem {
  id: string;
  type: string;
  title: string;
  creator?: string;
  year?: number;
  rating: number;
  status: string;
  visibility: string;
  short_review?: string;
  long_review?: string;
  viewed_at: string;
  time_precision?: string;
  canonical_works?: {
    canonical_id?: string;
    title_zh?: string;
    title_en?: string;
  } | null;
}

export default function WorksClientList({
  initialItems,
}: {
  initialItems: WorkItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [expandedReviews, setExpandedReviews] = useState<{
    [key: string]: boolean;
  }>({});

  const filteredItems = initialItems.filter((item) => {
    const titleZh = item.canonical_works?.title_zh || "";
    const titleEn = item.canonical_works?.title_en || "";
    const pureTitle = item.title || "";
    const creator = item.creator || "";
    const cid = item.canonical_works?.canonical_id || "";

    const matchesSearch =
      titleZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pureTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cid.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesRating = true;
    if (ratingFilter === "god") matchesRating = item.rating === 10;
    else if (ratingFilter === "high")
      matchesRating = item.rating >= 8 && item.rating < 10;
    else if (ratingFilter === "pass")
      matchesRating = item.rating >= 6 && item.rating < 8;
    else if (ratingFilter === "low") matchesRating = item.rating < 6;

    let matchesEra = true;
    const year = item.year;
    if (year) {
      if (eraFilter === "2020s") matchesEra = year >= 2020;
      else if (eraFilter === "2010s") matchesEra = year >= 2010 && year < 2020;
      else if (eraFilter === "2000s") matchesEra = year >= 2000 && year < 2010;
      else if (eraFilter === "90s") matchesEra = year >= 1990 && year < 2000;
      else if (eraFilter === "older") matchesEra = year < 1990;
    } else if (eraFilter !== "all") {
      matchesEra = false;
    }

    return matchesSearch && matchesRating && matchesEra;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentDisplayedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleFilterChange = (
    type: "search" | "rating" | "era",
    value: string,
  ) => {
    if (type === "search") setSearchQuery(value);
    if (type === "rating") setRatingFilter(value);
    if (type === "era") setEraFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 md:space-y-6 px-1">
      <div className="app-surface p-3 md:p-4 rounded-xl flex flex-col sm:grid sm:grid-cols-4 gap-3 items-center">
        <div className="w-full sm:col-span-2">
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-sans outline-none transition-colors focus:border-slate-400"
            placeholder="搜索作品名、导演作者、权威 ID..."
            value={searchQuery}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="w-full">
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-slate-400"
            value={ratingFilter}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
          >
            <option value="all">所有评分</option>
            <option value="god">10分 神作</option>
            <option value="high">8-9分 杰作</option>
            <option value="pass">6-7分 及格</option>
            <option value="low">6分以下</option>
          </select>
        </div>
        <div className="w-full">
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-slate-400"
            value={eraFilter}
            onChange={(e) => handleFilterChange("era", e.target.value)}
          >
            <option value="all">所有时代</option>
            <option value="2020s">时代 2020s</option>
            <option value="2010s">时代 2010s</option>
            <option value="2000s">时代 2000s</option>
            <option value="90s">时代 90s</option>
            <option value="older">世纪老片/古籍</option>
          </select>
        </div>
      </div>

      {/* 列表流 */}
      {currentDisplayedItems.length === 0 ? (
        <div className="mt-8 text-center border border-dashed rounded-xl p-12 text-xs text-slate-400 bg-white">
          未找到匹配的归档记录。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {currentDisplayedItems.map((item) => {
            const isExpanded = expandedReviews[item.id] || false;
            const hasLong = !!item.long_review;
            const isTooLong = hasLong && (item.long_review?.length || 0) > 120;

            return (
              <div
                key={item.id}
                className="app-surface p-4 md:p-6 rounded-2xl flex flex-col justify-between transition-shadow duration-150 hover:shadow-[0_20px_70px_rgba(15,23,42,0.09)] relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] md:text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {item.type === "movie" ? (
                          <Film className="size-3" />
                        ) : (
                          <BookOpen className="size-3" />
                        )}
                        {item.type === "movie" ? "电影" : "图书"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] md:text-xs text-slate-400">
                        {item.visibility === "private" ? (
                          <LockKeyhole className="size-3" />
                        ) : (
                          <Users className="size-3" />
                        )}
                        {item.visibility === "private" ? "私人" : "密友"}
                      </span>
                    </div>
                    <Link href={`/works/${item.id}/edit`} prefetch={false}>
                      <span className="text-xs text-slate-400 hover:text-slate-900 cursor-pointer border rounded px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                        编辑
                      </span>
                    </Link>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-slate-900 mt-3 break-all">
                    {item.canonical_works?.title_zh || item.title}
                    {item.year && (
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        ({item.year})
                      </span>
                    )}
                  </h3>
                  {item.creator && (
                    <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                      作者/导演：{item.creator}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-amber-700 mt-2 bg-amber-50/60 border border-amber-100/50 w-max px-2 py-0.5 rounded-lg">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {item.rating} / 10
                  </div>

                  {item.short_review && (
                    <p className="text-xs md:text-sm font-medium text-slate-800 mt-3 border-l-2 border-slate-200 pl-2 break-all">
                      “{item.short_review}”
                    </p>
                  )}

                  {hasLong && item.long_review && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        <span className="inline-flex items-center gap-1">
                          <PenLine className="size-3" />
                          我的长评
                        </span>
                      </span>
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-all">
                        {isTooLong && !isExpanded
                          ? `${item.long_review.slice(0, 120)}...`
                          : item.long_review}
                      </div>
                      {isTooLong && (
                        <button
                          onClick={() =>
                            setExpandedReviews((p) => ({
                              ...p,
                              [item.id]: !p[item.id],
                            }))
                          }
                          className="mt-2 text-[10px] font-bold text-slate-800 hover:underline"
                        >
                          {isExpanded ? (
                            <span className="inline-flex items-center gap-1">
                              <ChevronUp className="size-3" />
                              收起长评
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <ChevronDown className="size-3" />
                              展开全部
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right mt-4 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                  标记于{" "}
                  {item.time_precision === "year"
                    ? `${new Date(item.viewed_at).getFullYear()}年`
                    : item.time_precision === "month"
                      ? `${new Date(item.viewed_at).getFullYear()}年${new Date(item.viewed_at).getMonth() + 1}月`
                      : new Date(item.viewed_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页控制自适应 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2.5"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← 上一页
          </Button>
          <span className="text-xs font-semibold text-slate-600">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2.5"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            下一页 →
          </Button>
        </div>
      )}
    </div>
  );
}
