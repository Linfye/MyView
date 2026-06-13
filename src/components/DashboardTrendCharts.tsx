"use client";

import type React from "react";
import { useState } from "react";
import { BookOpen, Film } from "lucide-react";

type ArchiveItem = {
  type: string | null;
  rating: number | null;
  year: number | null;
  viewed_at?: string | null;
};

function buildRatingBuckets(items: ArchiveItem[]) {
  const map = new Map<number, number>();
  for (let rating = 10; rating >= 0; rating -= 1) map.set(rating, 0);

  items.forEach((item) => {
    if (item.rating === null || item.rating === undefined) return;
    const rating = Math.round(item.rating);
    if (!map.has(rating)) return;
    map.set(rating, (map.get(rating) || 0) + 1);
  });

  return Array.from(map.entries()).map(([label, count]) => ({
    label: `${label} 分`,
    count,
  }));
}

function buildEraBuckets(items: ArchiveItem[], span: 10 | 50) {
  const map = new Map<number, number>();

  items.forEach((item) => {
    if (!item.year) return;
    const start = Math.floor(item.year / span) * span;
    map.set(start, (map.get(start) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([start, count]) => ({
      label: span === 10 ? `${start}s` : `${start}-${start + span - 1}`,
      count,
    }));
}

function buildMarkedYearBuckets(items: ArchiveItem[]) {
  const map = new Map<string, { label: string; movie: number; book: number }>();

  items.forEach((item) => {
    if (!item.viewed_at) return;
    const date = new Date(item.viewed_at);
    if (Number.isNaN(date.getTime())) return;
    const year = String(date.getFullYear());
    const bucket = map.get(year) || { label: year, movie: 0, book: 0 };
    if (item.type === "movie") bucket.movie += 1;
    if (item.type === "book") bucket.book += 1;
    map.set(year, bucket);
  });

  return Array.from(map.values()).sort((a, b) => Number(a.label) - Number(b.label));
}

function DistributionChart({
  title,
  subtitle,
  data,
  emptyText,
}: {
  title: string;
  subtitle: string;
  data: { label: string; count: number }[];
  emptyText: string;
}) {
  const visibleData = data.filter((item) => item.count > 0);
  const max = Math.max(...visibleData.map((item) => item.count), 1);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>

      {visibleData.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-300">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleData.map((item) => {
            const percentage = (item.count / max) * 100;
            return (
              <div key={item.label} className="grid grid-cols-[72px_1fr_36px] items-center gap-3 text-xs">
                <span className="truncate font-medium text-slate-500">
                  {item.label}
                </span>
                <div className="h-5 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-[width] duration-500"
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  />
                </div>
                <span className="text-right font-semibold text-slate-700">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CategoryColumn({
  title,
  unit,
  icon,
  items,
  eraSpan,
}: {
  title: string;
  unit: string;
  icon: React.ReactNode;
  items: ArchiveItem[];
  eraSpan: 10 | 50;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
        <div>
          {icon}
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
        </div>
        <p className="mt-4 text-4xl font-black text-slate-800">
          {items.length}{" "}
          <span className="text-sm font-normal text-slate-400">{unit}</span>
        </p>
      </section>

      <DistributionChart
        title="评分分布"
        subtitle="只显示有记录的分数。"
        data={buildRatingBuckets(items)}
        emptyText="暂无评分数据"
      />

      <DistributionChart
        title="时间分布"
        subtitle={
          eraSpan === 10
            ? "按作品年份每 10 年归档。"
            : "按作品年份每 50 年归档。"
        }
        data={buildEraBuckets(items, eraSpan)}
        emptyText="暂无年份数据"
      />
    </div>
  );
}

function MarkedYearChart({ items }: { items: ArchiveItem[] }) {
  const data = buildMarkedYearBuckets(items);
  const [hoveredYear, setHoveredYear] = useState<{
    label: string;
    movie: number;
    book: number;
  } | null>(null);
  const maxRaw = Math.max(...data.map((item) => item.movie + item.book), 1);
  const tickStep = 100;
  const max = Math.max(tickStep, Math.ceil(maxRaw / tickStep) * tickStep);
  const ticks = Array.from(
    { length: max / tickStep + 1 },
    (_, index) => max - index * tickStep,
  );

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] lg:col-span-2">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">每年标记数量</h3>
          <p className="mt-1 text-xs text-slate-400">
            按标记时间统计电影和图书，横坐标为年份。
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-semibold text-slate-500">
          {hoveredYear && (
            <div className="rounded-xl bg-slate-900 px-3 py-2 text-left text-[11px] font-semibold text-white shadow-sm">
              <span className="mr-2">{hoveredYear.label}</span>
              <span className="mr-2 text-sky-200">电影 {hoveredYear.movie}</span>
              <span className="mr-2 text-emerald-200">图书 {hoveredYear.book}</span>
              <span>总计 {hoveredYear.movie + hoveredYear.book}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-sky-500" />
              电影
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-emerald-500" />
              图书
            </span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-300">
          暂无标记时间数据
        </div>
      ) : (
        <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3">
          <div className="relative h-64 border-r border-slate-200 pr-2">
            {ticks.map((tick, index) => (
              <span
                key={tick}
                className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-400"
                style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <div className="min-w-0 overflow-x-auto pb-1">
            <div
              className="relative grid h-[17.5rem] gap-2 px-2"
              style={{
                gridTemplateColumns: `repeat(${data.length}, minmax(34px, 1fr))`,
                minWidth: `${Math.max(data.length * 42, 520)}px`,
              }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-64 border-b border-slate-200">
                {ticks.map((tick, index) => (
                  <div
                    key={tick}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                    style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
                  />
                ))}
              </div>
              {data.map((item) => {
                const total = item.movie + item.book;
                const totalHeight = (total / max) * 100;
                const movieHeight = total > 0 ? (item.movie / total) * 100 : 0;
                const bookHeight = total > 0 ? (item.book / total) * 100 : 0;
                return (
                  <div
                    key={item.label}
                    className="group relative z-10 grid h-full min-w-0 grid-rows-[16rem_1.5rem] select-none"
                    onMouseEnter={() => setHoveredYear(item)}
                    onMouseLeave={() => setHoveredYear(null)}
                  >
                    <div className="flex h-64 w-full items-end justify-center">
                      <div
                        className="flex w-full max-w-14 flex-col-reverse overflow-hidden rounded-t-lg transition-shadow group-hover:shadow-[0_10px_25px_rgba(15,23,42,0.18)]"
                        style={{ height: `${Math.max(totalHeight, total ? 2 : 0)}%` }}
                      >
                        <div
                          className="bg-sky-500 transition-[height,background-color] group-hover:bg-sky-600"
                          style={{ height: `${movieHeight}%` }}
                        />
                        <div
                          className="bg-emerald-500 transition-[height,background-color] group-hover:bg-emerald-600"
                          style={{ height: `${bookHeight}%` }}
                        />
                      </div>
                    </div>
                    <span className="flex h-6 items-end justify-center border-t border-slate-200 text-center text-[10px] font-medium text-slate-400">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function DashboardTrendCharts({ items }: { items: ArchiveItem[] }) {
  const movieItems = items.filter((item) => item.type === "movie");
  const bookItems = items.filter((item) => item.type === "book");

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
      <CategoryColumn
        title="已看电影 / 剧集"
        unit="部"
        icon={<Film className="size-7 text-slate-800" />}
        items={movieItems}
        eraSpan={10}
      />
      <CategoryColumn
        title="已读图书 / 文献"
        unit="本"
        icon={<BookOpen className="size-7 text-slate-800" />}
        items={bookItems}
        eraSpan={50}
      />
      <MarkedYearChart items={items} />
    </div>
  );
}
