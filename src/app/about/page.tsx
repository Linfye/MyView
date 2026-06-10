"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 💡 next/navigation 负责留给 useRouter
import Link from "next/link"; // 💡 记住：Link 组件必须单独从 "next/link" 导入！

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-lg border border-slate-100 space-y-8">
        {/* 顶部面包屑/返回 */}
        <div className="flex justify-between items-center text-xs text-slate-400">
          <button
            onClick={() => router.back()}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            ← 返回上页
          </button>
          <span>MyView Manifest v1.0</span>
        </div>

        {/* 品牌理念 */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            关于 MyView
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            —— 记录你的精神留痕与文化记忆 ——
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-sm leading-relaxed border-y border-slate-100 py-6">
          <p>
            在这个被算法推荐和信息茧房裹挟的时代，我们每天都在被动消费着海量的碎片化内容。那些真正触动过我们的电影、启发过我们的书籍，往往在滑动手指的瞬间便隐入烟尘。
          </p>
          <p>
            <strong className="text-slate-900">MyView</strong>{" "}
            诞生于一个极其朴素的想法：
            <span className="bg-slate-100 px-1 rounded font-medium text-slate-900">
              为个体构建一座对抗遗忘的数字避难所
            </span>
            。这里没有虚荣的点赞数量，没有复杂的社交攀比，只有你与文化作品之间的纯粹共鸣。
          </p>
          <p>
            无论是午夜看完的一部冷门老片，还是枕边读了过半的晦涩诗集，你都可以将其安全地归档在此处。通过结构化的多维记录与私密的数据沉淀，MyView
            将帮助你绘制出专属的心灵演化轨迹。
          </p>
        </div>

        {/* 特性矩阵 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">🔒 绝对纯净</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              无广告、无推荐算法，100% 属于你个体的数字资产。
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">📊 记忆可视化</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              多维度的数据统计看板，清晰看见自己的精神图谱。
            </p>
          </div>
        </div>

        {/* 底部导航链接 */}
        <div className="pt-4 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
          >
            进入我的看板 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
