"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChartNoAxesColumn,
  Info,
  BarChart3,
  LockKeyhole,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AppNavProps {
  userId: string;
  initialDisplayName: string;
  initialLetter: string;
}

const navItems = [
  { href: "/works", label: "书影归档", icon: BookOpen },
  { href: "/dashboard", label: "数据统计", icon: ChartNoAxesColumn },
  { href: "/friends", label: "密友圈", icon: Users },
];

export default function AppNav({
  userId,
  initialDisplayName,
  initialLetter,
}: AppNavProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [profile, setProfile] = useState<{
    username?: string;
    display_name?: string;
    is_admin?: boolean;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, is_admin")
        .eq("id", userId)
        .single();

      if (mounted) setProfile(data);
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [supabase, userId]);

  const displayName = profile?.display_name || profile?.username || initialDisplayName;
  const avatarLetter = displayName.charAt(0).toUpperCase() || initialLetter;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <Link
          href="/works"
          prefetch={false}
          className="flex items-center space-x-2"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-teal-700 text-xs font-black text-white">
            M
          </span>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            MyView
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 text-sm font-medium shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800",
                  active && "bg-teal-700 text-white shadow-sm hover:bg-teal-700 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}

          {profile?.is_admin && (
            <Link
              href="/admin"
              prefetch={false}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-amber-700 transition-colors hover:bg-amber-50",
                pathname.startsWith("/admin") && "bg-amber-500 text-white shadow-sm hover:bg-amber-500",
              )}
            >
              <Shield className="size-3.5" />
              公共库
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={cn(
            "flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800",
          )}
          onClick={() => setAboutOpen(true)}
        >
          <Info className="size-4" />
          关于
        </button>

        <Link
          href="/settings"
          prefetch={false}
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white py-1 pl-4 pr-2 text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900",
            pathname.startsWith("/settings") &&
              "border-teal-200 bg-teal-50 text-teal-900",
          )}
        >
          <Settings className="size-4 opacity-70" />
          <span className="max-w-32 truncate text-sm font-semibold">
            {displayName}
          </span>
          <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-xs font-bold text-white shadow-sm">
            {avatarLetter}
          </div>
        </Link>
      </div>

      {aboutOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <section className="w-full max-w-2xl rounded-2xl border border-white/70 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.22)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Sparkles className="size-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  关于 MyView
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  记录你的精神留痕与文化记忆。
                </p>
              </div>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setAboutOpen(false)}
                aria-label="关闭关于"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 border-y border-slate-100 py-5 text-sm leading-7 text-slate-600">
              <p>
                MyView 是一个私人文化记忆空间，用来沉淀电影、图书和那些真正改变过你的作品。
              </p>
              <p>
                它不追求公开点赞和推荐算法，而是帮助你把观看、阅读、评分和长评留在一个稳定、可回看的结构里。
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <LockKeyhole className="mb-3 size-4 text-teal-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  私密优先
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  数据围绕你和密友关系组织，不制造公开社交压力。
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <BarChart3 className="mb-3 size-4 text-teal-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  可视化复盘
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  通过评分、时间线和归档趋势看见自己的文化轨迹。
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
