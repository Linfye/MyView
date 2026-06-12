"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import {
  BookOpen,
  Film,
  Grid2X2,
  List,
  LockKeyhole,
  Pencil,
  Star,
  Trash2,
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
  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const { notify, confirm, NoticeHost } = useAnimatedNotice();

  const filteredItems = items.filter((item) => {
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
  const currentPageIds = currentDisplayedItems.map((item) => item.id);
  const selectedOnPage = currentPageIds.filter((id) =>
    selectedIds.includes(id),
  );
  const allCurrentPageSelected =
    currentPageIds.length > 0 && selectedOnPage.length === currentPageIds.length;

  const handleFilterChange = (
    type: "search" | "rating" | "era" | "pageSize",
    value: string,
  ) => {
    if (type === "search") setSearchQuery(value);
    if (type === "rating") setRatingFilter(value);
    if (type === "era") setEraFilter(value);
    if (type === "pageSize") setItemsPerPage(Number(value));
    setCurrentPage(1);
    setPageInput("1");
  };

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
    setPageInput(String(safePage));
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id),
    );
  };

  const toggleCurrentPage = (checked: boolean) => {
    setSelectedIds((current) => {
      if (!checked) return current.filter((id) => !currentPageIds.includes(id));
      return Array.from(new Set([...current, ...currentPageIds]));
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0 || deleting) return;
    const confirmed = await confirm({
      title: "删除所选归档？",
      message: `确定要删除选中的 ${selectedIds.length} 条归档吗？此操作不可撤销。`,
      confirmText: "删除",
      dangerous: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase
      .from("user_items")
      .delete()
      .in("id", selectedIds);

    if (error) {
      notify("删除失败", error.message, "error");
      setDeleting(false);
      return;
    }

    setItems((current) =>
      current.filter((item) => !selectedIds.includes(item.id)),
    );
    notify("已删除", `已删除 ${selectedIds.length} 条归档。`, "success");
    setSelectedIds([]);
    setDeleting(false);
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
      <NoticeHost />
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
        {!readOnly && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 accent-teal-700"
                checked={allCurrentPageSelected}
                onChange={(event) => toggleCurrentPage(event.target.checked)}
              />
              选择本页
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0 || deleting}
              onClick={handleBatchDelete}
              className="h-9 gap-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 sm:self-end"
            >
              <Trash2 className="size-4" />
              {deleting ? "正在删除..." : `删除所选 (${selectedIds.length})`}
            </Button>
          </div>
        )}
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
              className="group relative rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
            >
              {!readOnly && (
                <label className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-lg border border-slate-200 bg-white/95 shadow-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-300 accent-teal-700"
                    checked={selectedIds.includes(item.id)}
                    onChange={(event) =>
                      toggleSelected(item.id, event.target.checked)
                    }
                    aria-label="选择归档"
                  />
                </label>
              )}
              <Link
                href={`${detailBasePath}/${item.id}`}
                prefetch={false}
                className={`block space-y-3 ${!readOnly ? "pl-9" : ""}`}
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
                  className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 hover:shadow-md"
                  aria-label="编辑"
                >
                  <Pencil className="size-4" />
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
                  : "grid-cols-[34px_1.4fr_0.8fr_0.5fr_0.5fr_86px]"
              }`}
            >
              {!readOnly && <span />}
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
                      : "grid-cols-[34px_1.4fr_0.8fr_0.5fr_0.5fr_86px]"
                  }`}
                >
                  {!readOnly && (
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-slate-300 accent-teal-700"
                      checked={selectedIds.includes(item.id)}
                      onChange={(event) =>
                        toggleSelected(item.id, event.target.checked)
                      }
                      aria-label="选择归档"
                    />
                  )}
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
                      className="inline-flex h-8 items-center justify-end rounded-lg px-3 text-right text-sm font-semibold text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-800"
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
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2.5"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ← 上一页
          </Button>
          <span className="text-xs font-semibold text-slate-600">
            第 {currentPage} / {totalPages} 页，共 {filteredItems.length} 条
          </span>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              goToPage(Number(pageInput) || 1);
            }}
          >
            <input
              type="number"
              min={1}
              max={totalPages}
              className="field-control h-8 w-20 px-2 py-1 text-center text-xs"
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              aria-label="跳转页码"
            />
            <Button type="submit" variant="outline" size="sm" className="h-8 px-2.5 text-xs">
              跳转
            </Button>
          </form>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2.5"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            下一页 →
          </Button>
        </div>
      )}
    </div>
  );
}
