"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { PenLine } from "lucide-react";

export default function AdminEditCanonicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [canonicalId, setCanonicalId] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("");
  const [firstPublishedYear, setFirstPublishedYear] = useState("");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { notify, NoticeHost } = useAnimatedNotice();

  // 1. 读取当前要编辑的权威词条
  useEffect(() => {
    async function fetchCanonical() {
      const { data, error } = await supabase
        .from("canonical_works")
        .select("canonical_id, title_zh, title_en, original_title, creator_name, original_language, first_published_year")
        .eq("id", id)
        .single();

      if (error) {
        notify("获取权威词条失败", error.message, "error");
        router.push("/admin");
        return;
      }

      if (data) {
        setCanonicalId(data.canonical_id);
        setTitleZh(data.title_zh || "");
        setTitleEn(data.title_en || "");
        setOriginalTitle(data.original_title || "");
        setCreatorName(data.creator_name || "");
        setOriginalLanguage(data.original_language || "");
        setFirstPublishedYear(
          data.first_published_year ? data.first_published_year.toString() : "",
        );
      }
      setFetching(false);
    }
    fetchCanonical();
  }, [id, supabase, router, notify]);

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 2. 将管理员手动整理的精美元数据灌入数据库
    const { error } = await supabase
      .from("canonical_works")
      .update({
        title_zh: titleZh || null,
        title_en: titleEn || null,
        original_title: originalTitle || null,
        creator_name: creatorName || null,
        original_language: originalLanguage || null,
        first_published_year: firstPublishedYear
          ? parseInt(firstPublishedYear)
          : null,
      })
      .eq("id", id);

    if (error) {
      notify("更新权威库失败", error.message, "error");
      setLoading(false);
      return;
    }

    notify("权威词条已发布", "公共库元数据已经更新。", "success");
    window.setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 520);
  };

  if (fetching)
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        正在调取词条档案...
      </div>
    );

  return (
    <div className="max-w-xl mx-auto app-surface p-8 rounded-2xl space-y-6">
      <NoticeHost />
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <PenLine className="size-5" />
          编纂权威文献元数据
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          正在为通用大写 ID{" "}
          <code className="font-mono font-bold text-slate-800 bg-slate-100 px-1 rounded">
            {canonicalId}
          </code>{" "}
          注入标准多语言属性。
        </p>
      </div>

      <form onSubmit={handleAdminUpdate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              中文规范名 (Title ZH)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如：盗梦空间"
              value={titleZh}
              onChange={(e) => setTitleZh(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              英文规范名 (Title EN)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如：Inception"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">
            原始语言首发片名/书名 (Original Title)
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
            placeholder="非英美作品选填"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">
            标准主创姓名 (导演/作者)
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
            placeholder="如：Christopher Nolan"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              首发/上映年份
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如：2010"
              value={firstPublishedYear}
              onChange={(e) => setFirstPublishedYear(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              原产国语种缩写
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border p-2 text-sm focus:outline-none focus:border-slate-400"
              placeholder="如: en, zh, ja, fr"
              value={originalLanguage}
              onChange={(e) => setOriginalLanguage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end border-t pt-4 mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "正在写入主库..." : "发布权威词条"}
          </Button>
        </div>
      </form>
    </div>
  );
}
