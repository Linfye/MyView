"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, LockKeyhole, Sparkles } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_80%_5%,rgba(14,165,233,0.12),transparent_24rem),linear-gradient(180deg,#f8fafc,#eef2f7)] p-6 font-sans">
      <div className="max-w-2xl w-full app-surface rounded-2xl p-8 md:p-10 space-y-8">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <button
            onClick={() => router.back()}
            className="hover:text-slate-950 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" />
            返回上页
          </button>
          <span>MyView Manifest v1.0</span>
        </div>

        <div className="space-y-3 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-xl bg-teal-700 text-white">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            关于 MyView
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            记录你的精神留痕与文化记忆
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-sm leading-relaxed border-y border-slate-100 py-6">
          <p>
            在这个被算法推荐和信息茧房裹挟的时代，我们每天都在被动消费着海量的碎片化内容。那些真正触动过我们的电影、启发过我们的书籍，往往在滑动手指的瞬间便隐入烟尘。
          </p>
          <p>
            <strong className="text-slate-900">MyView</strong>{" "}
            诞生于一个极其朴素的想法：
            <span className="bg-slate-100 px-1.5 py-0.5 rounded-md font-medium text-slate-900">
              为个体构建一座对抗遗忘的数字避难所
            </span>
            。这里没有虚荣的点赞数量，没有复杂的社交攀比，只有你与文化作品之间的纯粹共鸣。
          </p>
          <p>
            无论是午夜看完的一部冷门老片，还是枕边读了过半的晦涩诗集，你都可以将其安全地归档在此处。通过结构化的多维记录与私密的数据沉淀，MyView
            将帮助你绘制出专属的心灵演化轨迹。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <LockKeyhole className="mb-3 size-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-950">绝对纯净</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              无广告、无推荐算法，100% 属于你个体的数字资产。
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <BarChart3 className="mb-3 size-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-950">记忆可视化</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              多维度的数据统计看板，清晰看见自己的精神图谱。
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/dashboard"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-sm transition-colors duration-150"
          >
            进入我的看板
          </Link>
        </div>
      </div>
    </div>
  );
}
