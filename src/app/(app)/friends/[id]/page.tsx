"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface FriendWorkItem {
  id: string;
  type: string;
  title: string;
  creator?: string;
  year?: number;
  rating: number;
  short_review?: string;
  long_review?: string;
  viewed_at: string;
  canonical_work_id?: string | null;
  canonical_works?: {
    canonical_id?: string;
    title_zh?: string;
    title_en?: string;
    creator_name?: string;
  } | null;
}

interface CommonItemMatch {
  title: string;
  type: string;
  canonicalId?: string;
  myRating: number;
  friendRating: number;
}

export default function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: friendId } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [friendProfile, setFriendProfile] = useState<{
    username: string;
    display_name?: string;
    bio?: string;
    contact_info?: string;
  } | null>(null);
  const [friendItems, setFriendItems] = useState<FriendWorkItem[]>([]);
  const [commonItems, setCommonItems] = useState<CommonItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [expandedReviews, setExpandedReviews] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    async function loadFriendData() {
      const {
        data: { user: me },
      } = await supabase.auth.getUser();
      if (!me) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, bio, contact_info")
        .eq("id", friendId)
        .single();
      setFriendProfile(profile);

      const { data: fItems } = await supabase
        .from("user_items")
        .select(
          `*, canonical_works ( canonical_id, title_zh, title_en, creator_name )`,
        )
        .eq("user_id", friendId)
        .order("viewed_at", { ascending: false });

      const cleanFriendItems = (fItems || []) as unknown as FriendWorkItem[];
      setFriendItems(cleanFriendItems);

      const { data: myItems } = await supabase
        .from("user_items")
        .select(`*, canonical_works ( canonical_id )`)
        .eq("user_id", me.id)
        .not("canonical_work_id", "is", null);

      const cleanMyItems = (myItems || []) as unknown as FriendWorkItem[];

      if (cleanMyItems.length > 0 && cleanFriendItems.length > 0) {
        const intersection: CommonItemMatch[] = [];
        cleanMyItems.forEach((myItem) => {
          const match = cleanFriendItems.find(
            (fItem) => fItem.canonical_work_id === myItem.canonical_work_id,
          );
          if (match) {
            intersection.push({
              title:
                match.canonical_works?.title_zh || match.title || myItem.title,
              type: match.type,
              canonicalId: match.canonical_works?.canonical_id,
              myRating: myItem.rating,
              friendRating: match.rating,
            });
          }
        });
        setCommonItems(intersection);
      }
      setLoading(false);
    }
    loadFriendData();
  }, [friendId, supabase]);

  const filteredItems = friendItems.filter((item) => {
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

  if (loading)
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        正在调取密友的文化记忆档案...
      </div>
    );
  if (!friendProfile)
    return (
      <div className="text-center py-12 text-sm text-red-500">
        未找到该密友资料。
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
            {(friendProfile.display_name || friendProfile.username)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {friendProfile.display_name}
              </h1>
              {friendProfile.contact_info && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  📱 联络: {friendProfile.contact_info}
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-400">
              @{friendProfile.username}
            </p>
            {friendProfile.bio && (
              <p className="text-xs text-slate-500 mt-2 italic">
                “{friendProfile.bio}”
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          返回密友圈
        </Button>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          🧠 心有灵犀 · 共同归档匹配 ({commonItems.length})
        </h3>
        {commonItems.length === 0 ? (
          <p className="text-xs text-slate-400 mt-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 text-center italic">
            暂时还没有重合的权威归档。
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {commonItems.map((match, i) => (
              <div
                key={i}
                className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">
                      {match.type === "movie" ? "🎬 共同看过" : "📚 共同读过"}
                    </span>
                    <code className="text-[10px] font-mono text-slate-600 bg-slate-950 px-1 rounded">
                      {match.canonicalId}
                    </code>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-1.5">
                    {match.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between gap-4 mt-4 bg-slate-950/60 px-3 py-1.5 rounded-lg text-xs border border-slate-900">
                  <div className="text-slate-400">
                    我打：
                    <span className="font-bold text-amber-500">
                      {match.myRating}分
                    </span>
                  </div>
                  <div className="text-slate-400">
                    对方打：
                    <span className="font-bold text-emerald-400">
                      {match.friendRating}分
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2">
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400 font-sans"
            placeholder="搜索作品名、导演作者、权威 ID..."
            value={searchQuery}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
            value={ratingFilter}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
          >
            <option value="all">⭐ 所有评分</option>
            <option value="god">👑 10分 神作</option>
            <option value="high">🔥 8-9分 杰作</option>
            <option value="pass">👌 6-7分 及格</option>
            <option value="low">🗑️ 6分以下</option>
          </select>
        </div>
        <div>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-slate-400"
            value={eraFilter}
            onChange={(e) => handleFilterChange("era", e.target.value)}
          >
            <option value="all">⏳ 所有时代</option>
            <option value="2020s">时代 2020s</option>
            <option value="2010s">时代 2010s</option>
            <option value="2000s">时代 2000s</option>
            <option value="90s">时代 90s</option>
            <option value="older">世纪老片/古籍</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-slate-800">
            📖 归档记忆档案 ({filteredItems.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            当前页展示 {currentDisplayedItems.length} 条
          </span>
        </div>

        {currentDisplayedItems.length === 0 ? (
          <p className="text-xs text-slate-400 p-12 border border-dashed rounded-2xl text-center bg-white">
            未找到符合条件的归档条目。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {currentDisplayedItems.map((item) => {
              const isExpanded = expandedReviews[item.id] || false;
              const hasLong = !!item.long_review;
              const isTooLong =
                hasLong && (item.long_review?.length || 0) > 120;
              const displayedLong =
                isTooLong && !isExpanded
                  ? `${item.long_review?.slice(0, 120)}...`
                  : item.long_review;

              return (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {item.type === "movie" ? "🎬 电影" : "📚 图书"}
                      </span>
                      {item.canonical_works?.canonical_id && (
                        <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                          {item.canonical_works.canonical_id}
                        </code>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">
                      {item.canonical_works?.title_zh || item.title}
                      {item.year && (
                        <span className="text-xs font-normal text-slate-400 ml-1">
                          ({item.year})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      主创：
                      {item.canonical_works?.creator_name ||
                        item.creator ||
                        "未知"}
                    </p>
                    <div className="text-xs font-bold text-amber-600 mt-2 bg-amber-50/60 border border-amber-100/50 w-max px-2 py-0.5 rounded">
                      ⭐ {item.rating} / 10
                    </div>

                    {item.short_review && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-slate-800 border-l-2 border-slate-200 pl-2">
                          “{item.short_review}”
                        </p>
                      </div>
                    )}

                    {hasLong && (
                      <div className="mt-4 pt-3 border-t border-slate-100/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          ✒️ 深度长评
                        </span>
                        <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                          {displayedLong}
                        </div>
                        {isTooLong && (
                          <button
                            onClick={() =>
                              setExpandedReviews((p) => ({
                                ...p,
                                [item.id]: !p[item.id],
                              }))
                            }
                            className="mt-2 text-[11px] font-bold text-slate-900 hover:underline block ml-1"
                          >
                            {isExpanded ? "▲ 收起长评" : "▼ 展开全部长评"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right mt-6 pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                    标记于 {item.viewed_at}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              ← 上一页
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              第 {currentPage} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              下一页 →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
