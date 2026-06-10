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
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AppNavProps {
  userId: string;
  initialDisplayName: string;
  initialLetter: string;
  signOutAction: () => Promise<void>;
}

const navItems = [
  { href: "/works", label: "书影归档", icon: BookOpen },
  { href: "/dashboard", label: "数据统计", icon: ChartNoAxesColumn },
  { href: "/friends", label: "朋友", icon: Users },
];

export default function AppNav({
  userId,
  initialDisplayName,
  initialLetter,
  signOutAction,
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

  const displayName =
    profile?.display_name || profile?.username || initialDisplayName;
  const avatarLetter = displayName.charAt(0).toUpperCase() || initialLetter;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center md:gap-6">
        <Link
          href="/works"
          prefetch={false}
          className="flex w-max items-center space-x-2"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-teal-700 text-xs font-black text-white">
            M
          </span>
          <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
            MyView
          </span>
        </Link>

        <nav className="flex w-full max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 text-xs font-medium shadow-sm sm:w-auto sm:flex-nowrap sm:text-sm">
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
                  "flex h-8 min-w-[4.75rem] flex-1 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 sm:h-auto sm:min-w-0 sm:flex-none sm:justify-start sm:gap-1.5 sm:px-3 sm:py-1.5",
                  active &&
                    "bg-teal-700 text-white shadow-sm hover:bg-teal-700 hover:text-white",
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
                "flex h-8 min-w-[4.75rem] flex-1 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-amber-700 transition-colors hover:bg-amber-50 sm:h-auto sm:min-w-0 sm:flex-none sm:justify-start sm:gap-1.5 sm:px-3 sm:py-1.5",
                pathname.startsWith("/admin") &&
                  "bg-amber-500 text-white shadow-sm hover:bg-amber-500",
              )}
            >
              <Shield className="size-3.5" />
              公共库
            </Link>
          )}
        </nav>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
          )}
          onClick={() => setAboutOpen((open) => !open)}
        >
          <Info className="size-4" />
          关于
        </button>

        <Link
          href="/settings"
          prefetch={false}
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={cn(
            "flex h-9 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900 sm:h-10 sm:gap-3 sm:pl-4 sm:pr-2",
            pathname.startsWith("/settings") &&
              "border-teal-200 bg-teal-50 text-teal-900",
          )}
        >
          <Settings className="size-4 opacity-70" />
          <span className="max-w-20 truncate text-xs font-semibold sm:max-w-32 sm:text-sm">
            {displayName}
          </span>
          <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-[11px] font-bold text-white shadow-sm sm:size-8 sm:text-xs">
            {avatarLetter}
          </div>
        </Link>

        <form action={signOutAction} className="shrink-0">
          <Button
            variant="outline"
            type="submit"
            className="h-9 rounded-xl border-red-100 bg-white px-3 text-xs font-semibold text-red-500 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:h-10 sm:px-4 sm:text-sm"
          >
            <LogOut className="size-4" />
            退出
          </Button>
        </form>
      </div>

      {aboutOpen && (
        <section className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] max-h-[calc(100vh-7rem)] w-[min(92vw,42rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 sm:p-6">
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

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <LockKeyhole className="mb-3 size-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                私密优先
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                数据围绕你和朋友关系组织，不制造公开社交压力。
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
      )}
    </div>
  );
}
