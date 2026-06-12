"use client";

import type React from "react";
import { BookOpen, Film } from "lucide-react";

type ArchiveItem = {
  type: string | null;
  rating: number | null;
  year: number | null;
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
    </div>
  );
}
