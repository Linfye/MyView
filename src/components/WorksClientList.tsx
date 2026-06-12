"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import {
  BookOpen,
  Film,
  Grid2X2,
  List,
  LockKeyhole,
  Pencil,
  Star,
  Users,
} from "lucide-react";

interface WorkItem {
  id: string;
  type: string;
  title: string;
  creator?: string;
  year?: number;
  rating: number;
  status?: string;
  visibility: string;
  short_review?: string;
  long_review?: string;
  poster_url?: string | null;
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
  readOnly = false,
  detailBasePath = "/works",
}: {
  initialItems: WorkItem[];
  readOnly?: boolean;
  detailBasePath?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

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
      if (eraFilter === "2020s") matchesEra = year >= 2020 && year < 2030;
      else if (eraFilter === "2010s") matchesEra = year >= 2010 && year < 2020;
      else if (eraFilter === "2000s") matchesEra = year >= 2000 && year < 2010;
      else if (eraFilter === "90s") matchesEra = year >= 1990 && year < 2000;
      else if (eraFilter === "80s") matchesEra = year >= 1980 && year < 1990;
      else if (eraFilter === "70s") matchesEra = year >= 1970 && year < 1980;
      else if (eraFilter === "60s") matchesEra = year >= 1960 && year < 1970;
      else if (eraFilter === "50s") matchesEra = year >= 1950 && year < 1960;
      else if (eraFilter === "older") matchesEra = year < 1950;
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
    type: "search" | "rating" | "era" | "pageSize",
    value: string,
  ) => {
    if (type === "search") setSearchQuery(value);
    if (type === "rating") setRatingFilter(value);
    if (type === "era") setEraFilter(value);
    if (type === "pageSize") setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const ratingOptions = [
    { value: "all", label: "所有评分" },
    { value: "god", label: "10分" },
    { value: "high", label: "8-9分" },
    { value: "pass", label: "6-7分" },
    { value: "low", label: "6分以下" },
  ];
  const eraOptions = [
    { value: "all", label: "所有时代" },
    { value: "2020s", label: "2020s" },
    { value: "2010s", label: "2010s" },
    { value: "2000s", label: "2000s" },
    { value: "90s", label: "1990s" },
    { value: "80s", label: "1980s" },
    { value: "70s", label: "1970s" },
    { value: "60s", label: "1960s" },
    { value: "50s", label: "1950s" },
    { value: "older", label: "1950以前" },
  ];
  const pageSizeOptions = [
    { value: "20", label: "每页 20" },
    { value: "50", label: "每页 50" },
    { value: "100", label: "每页 100" },
  ];

  return (
    <div className="space-y-4 px-1">
      <div className="app-surface rounded-xl p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.7fr_auto]">
          <input
            type="text"
            className="field-control h-9 text-sm"
            placeholder="搜索作品名、导演作者、权威 ID..."
            value={searchQuery}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <SelectMenu
            value={ratingFilter}
            onValueChange={(value) => handleFilterChange("rating", value)}
            options={ratingOptions}
            ariaLabel="筛选评分"
          />
          <SelectMenu
            value={eraFilter}
            onValueChange={(value) => handleFilterChange("era", value)}
            options={eraOptions}
            ariaLabel="筛选年代"
          />
          <SelectMenu
            value={String(itemsPerPage)}
            onValueChange={(value) => handleFilterChange("pageSize", value)}
            options={pageSizeOptions}
            ariaLabel="每页数量"
          />
          <div className="flex h-9 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              aria-label="卡片视图"
              className={`grid size-7 place-items-center rounded-md transition-colors ${
                viewMode === "cards"
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              onClick={() => setViewMode("cards")}
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label="列表视图"
              className={`grid size-7 place-items-center rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {currentDisplayedItems.length === 0 ? (
        <div className="mt-8 text-center border border-dashed rounded-xl p-12 text-xs text-slate-400 bg-white">
          未找到匹配的归档记录。
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {currentDisplayedItems.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-colors hover:border-teal-200 hover:bg-white"
            >
              <Link
                href={`${detailBasePath}/${item.id}`}
                prefetch={false}
                className="block space-y-3"
              >
                <div className="flex items-start gap-3">
                  {item.poster_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.poster_url}
                      alt=""
                      className="h-24 w-16 shrink-0 rounded-lg object-cover border border-slate-100 bg-slate-100"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                      {item.canonical_works?.title_zh || item.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.creator || "未知主创"}
                      {item.year ? ` · ${item.year}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {item.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="meta-pill gap-1">
                    {item.type === "movie" ? (
                      <Film className="size-3" />
                    ) : (
                      <BookOpen className="size-3" />
                    )}
                    {item.type === "movie" ? "电影" : "图书"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {item.visibility === "private" ? (
                      <LockKeyhole className="size-3" />
                    ) : (
                      <Users className="size-3" />
                    )}
                    {item.visibility === "private" ? "私人" : "公开"}
                  </span>
                </div>
                {item.short_review && (
                  <p className="line-clamp-2 min-h-9 text-xs leading-5 text-slate-600">
                    {item.short_review}
                  </p>
                )}
              </Link>
              {!readOnly && (
                <Link
                  href={`/works/${item.id}/edit`}
                  prefetch={false}
                  className="absolute bottom-3 right-3 grid size-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="编辑"
                >
                  <Pencil className="size-3.5" />
                </Link>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90">
          <div className={readOnly ? "min-w-[640px]" : "min-w-[720px]"}>
            <div
              className={`grid gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 ${
                readOnly
                  ? "grid-cols-[1.4fr_0.8fr_0.5fr_0.5fr]"
                  : "grid-cols-[1.4fr_0.8fr_0.5fr_0.5fr_70px]"
              }`}
            >
              <span>作品</span>
              <span>主创</span>
              <span>类型</span>
              <span>评分</span>
              {!readOnly && <span className="text-right">操作</span>}
            </div>
            {currentDisplayedItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`grid gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 hover:bg-slate-50/80 ${
                    readOnly
                      ? "grid-cols-[1.4fr_0.8fr_0.5fr_0.5fr]"
                      : "grid-cols-[1.4fr_0.8fr_0.5fr_0.5fr_70px]"
                  }`}
                >
                  <Link
                    href={`${detailBasePath}/${item.id}`}
                    prefetch={false}
                    className="min-w-0 font-medium text-slate-900 hover:text-teal-700"
                  >
                    <span className="block truncate">
                      {item.canonical_works?.title_zh || item.title}
                      {item.year ? ` (${item.year})` : ""}
                    </span>
                    {item.short_review && (
                      <span className="mt-0.5 block truncate text-xs font-normal text-slate-500">
                        {item.short_review}
                      </span>
                    )}
                  </Link>
                  <span className="truncate text-slate-500">
                    {item.creator || "未知"}
                  </span>
                  <span className="text-slate-500">
                    {item.type === "movie" ? "电影" : "图书"}
                  </span>
                  <span className="font-semibold text-amber-700">
                    {item.rating}
                  </span>
                  {!readOnly && (
                    <Link
                      href={`/works/${item.id}/edit`}
                      prefetch={false}
                      className="text-right text-xs font-medium text-slate-400 hover:text-slate-800"
                    >
                      编辑
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
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
            第 {currentPage} / {totalPages} 页，共 {filteredItems.length} 条
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
