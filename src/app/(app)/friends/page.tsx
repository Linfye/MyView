"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { Search, Users, Clock3, UserPlus } from "lucide-react";

interface RequestProfile {
  username: string;
  display_name?: string;
}

interface IncomingRequest {
  id: string;
  requester_id: string;
  profiles: RequestProfile | RequestProfile[] | null;
}

interface FriendProfileRow {
  id: string;
  username: string;
  display_name?: string;
}

interface AcceptedFriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  requester_profile: FriendProfileRow | FriendProfileRow[] | null;
  addressee_profile: FriendProfileRow | FriendProfileRow[] | null;
}

export default function FriendsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<FriendProfileRow | null>(
    null,
  );
  const [searchMessage, setSearchMessage] = useState("");

  const [pendingRequests, setPendingRequests] = useState<IncomingRequest[]>([]);
  const [friendsList, setFriendsList] = useState<FriendProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { notify, NoticeHost } = useAnimatedNotice();

  const fetchFriendshipsData = useCallback(async (userId: string) => {
    setLoading(true);

    const [{ data: incoming }, { data: acceptedRows }] = await Promise.all([
      supabase
        .from("friendships")
        .select(
          `id, requester_id, profiles!friendships_requester_id_fkey ( username, display_name )`,
        )
        .eq("addressee_id", userId)
        .eq("status", "pending"),
      supabase
        .from("friendships")
        .select(
          `
          id,
          requester_id,
          addressee_id,
          requester_profile:profiles!friendships_requester_id_fkey ( id, username, display_name ),
          addressee_profile:profiles!friendships_addressee_id_fkey ( id, username, display_name )
        `,
        )
        .eq("status", "accepted"),
    ]);

    const rawIncoming = (incoming || []) as unknown as IncomingRequest[];
    const rawAccepted = (acceptedRows ||
      []) as unknown as AcceptedFriendshipRow[];

    const cleanFriends = rawAccepted
      .map((row) => {
        const rProf = Array.isArray(row.requester_profile)
          ? row.requester_profile[0]
          : row.requester_profile;
        const aProf = Array.isArray(row.addressee_profile)
          ? row.addressee_profile[0]
          : row.addressee_profile;

        if (row.requester_id === userId && aProf) {
          return {
            id: aProf.id,
            username: aProf.username,
            display_name: aProf.display_name || "",
          };
        } else if (rProf) {
          return {
            id: rProf.id,
            username: rProf.username,
            display_name: rProf.display_name || "",
          };
        }
        return null;
      })
      .filter((f) => f !== null && f.id !== userId) as FriendProfileRow[];

    setPendingRequests(rawIncoming);
    setFriendsList(cleanFriends);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchFriendshipsData(user.id);
      }
    }
    init();
  }, [fetchFriendshipsData, supabase.auth]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResult(null);
    setSearchMessage("");

    if (!searchUsername.trim()) return;
    const targetName = searchUsername.trim().toLowerCase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (myProfile?.username === targetName) {
        setSearchMessage("无法搜索你自己的账号");
        return;
      }
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("username", targetName)
      .single();

    if (error || !profile) {
      setSearchMessage("未找到该用户，请检查用户名是否完全匹配");
    } else {
      setSearchResult(profile as FriendProfileRow);
    }
  };

  const sendRequest = async (targetId: string) => {
    if (!currentUserId) return;
    if (actionId) return;
    setActionId(targetId);

    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${currentUserId})`,
      );

    if (existing && existing.length > 0) {
      notify("连线已存在", "这位用户已经是密友，或申请正在等待确认。", "info");
      setActionId(null);
      return;
    }

    const { error } = await supabase.from("friendships").insert([
      {
        requester_id: currentUserId,
        addressee_id: targetId,
        status: "pending",
      },
    ]);

    if (error) {
      notify("发送申请失败", error.message, "error");
    } else {
      notify("申请已发送", "等待对方确认后即可查看授权内容。", "success");
      setSearchResult(null);
      setSearchUsername("");
    }
    setActionId(null);
  };

  const respondRequest = async (friendshipId: string, accept: boolean) => {
    if (actionId) return;
    setActionId(friendshipId);
    if (accept) {
      await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
    } else {
      await supabase.from("friendships").delete().eq("id", friendshipId);
    }
    if (currentUserId) await fetchFriendshipsData(currentUserId);
    notify(accept ? "已接受申请" : "已忽略申请", undefined, "success");
    setActionId(null);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <NoticeHost />
      <div className="md:col-span-1 space-y-6">
        <div className="app-surface p-6 rounded-2xl">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Search className="size-4" />
            添加密友
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            MyView 采用纯私密图谱，不支持公共模糊搜索。
          </p>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
              type="text"
              required
              className="flex-1 rounded-lg border p-2 text-xs focus:outline-none focus:border-slate-400 font-mono"
              placeholder="输入唯一用户名"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
            />
            <Button type="submit" size="sm" className="text-xs">
              搜索
            </Button>
          </form>
          {searchMessage && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mt-3 border border-amber-100/50">
              {searchMessage}
            </p>
          )}
          {searchResult && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {searchResult.display_name}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  @{searchResult.username}
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-7"
                disabled={actionId === searchResult.id}
                onClick={() => sendRequest(searchResult.id)}
              >
                <UserPlus className="size-3.5" />
                {actionId === searchResult.id ? "发送中" : "建立连线"}
              </Button>
            </div>
          )}
        </div>

        <div className="app-surface p-6 rounded-2xl">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock3 className="size-4" />
            密友申请通知 ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 mt-3">
              暂无收到的待确认密友申请。
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingRequests.map((req) => {
                const prof = Array.isArray(req.profiles)
                  ? req.profiles[0]
                  : req.profiles;
                return (
                  <div
                    key={req.id}
                    className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 flex flex-col gap-2"
                  >
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">
                        {prof?.display_name || "新朋友"}
                      </span>
                      <span className="text-slate-400 font-mono block">
                        @{prof?.username}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-[10px] h-6 flex-1 bg-slate-900 text-white"
                        disabled={actionId === req.id}
                        onClick={() => respondRequest(req.id, true)}
                      >
                        接受
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-6 flex-1"
                        disabled={actionId === req.id}
                        onClick={() => respondRequest(req.id, false)}
                      >
                        忽略
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 app-surface p-6 rounded-2xl">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Users className="size-4" />
          我的密友节点 ({friendsList.length})
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          已建立双向信任链的朋友，点击可查看其公开授权的私人角落。
        </p>
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">
            正在检索密友图谱...
          </div>
        ) : friendsList.length === 0 ? (
          <div className="mt-8 text-center border border-dashed rounded-xl p-12 text-xs text-slate-400 bg-slate-50/50">
            孤岛状态。目前还没有和任何人建立连线。
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                className="p-4 border border-slate-100 bg-slate-50/40 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {friend.display_name || "未命名"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    @{friend.username}
                  </p>
                </div>
                <Link href={`/friends/${friend.id}`} prefetch={false}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-white hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    查看书影单
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
