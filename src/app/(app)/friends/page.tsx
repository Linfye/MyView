"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function FriendsPage() {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 状态组
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchMessage, setSearchMessage] = useState("");

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await fetchFriendships(user.id);
      }
    }
    init();
  }, []);

  // 1. 核心拉取：获取待审批申请和已通过密友名单
  async function fetchFriendships(userId: string) {
    setLoading(true);

    // 拉取别人发给我的 pending 申请
    const { data: incoming } = await supabase
      .from("friendships")
      .select(
        `
        id,
        requester_id,
        profiles!friendships_requester_id_fkey ( username, display_name )
      `,
      )
      .eq("addressee_id", userId)
      .eq("status", "pending");

    // 拉取我已经达成的密友（需要考虑我是发起者，或者我是被加者两种情况）
    const { data: acceptedRows } = await supabase
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
      .eq("status", "accepted");

    // 清洗数据：过滤出真正的好友资料
    const cleanFriends = (acceptedRows || [])
      .map((row: any) => {
        if (row.requester_id === userId) {
          return { friendshipId: row.id, ...row.addressee_profile };
        } else {
          return { friendshipId: row.id, ...row.requester_profile };
        }
      })
      .filter((f) => f.id !== userId); // 排除自己

    setPendingRequests(incoming || []);
    setFriendsList(cleanFriends);
    setLoading(false);
  }

  // 2. 精准搜索好友
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResult(null);
    setSearchMessage("");

    if (!searchUsername.trim()) return;
    const targetName = searchUsername.trim().toLowerCase();

    // 不能搜自己
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
      setSearchResult(profile);
    }
  };

  // 3. 发送密友申请
  const sendRequest = async (targetId: string) => {
    if (!currentUserId) return;

    // 检查是否已经存在关系
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${currentUserId})`,
      );

    if (existing && existing.length > 0) {
      alert("密友连线已存在，或申请正处于待确认状态。");
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
      alert("发送申请失败：" + error.message);
    } else {
      alert("申请成功，等待对方确认！");
      setSearchResult(null);
      setSearchUsername("");
    }
  };

  // 4. 接受或拒绝申请
  const respondRequest = async (friendshipId: string, accept: boolean) => {
    if (accept) {
      await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
    } else {
      await supabase.from("friendships").delete().eq("id", friendshipId);
    }
    if (currentUserId) await fetchFriendships(currentUserId);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 左侧：精准密友搜索区 */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">🔍 添加密友</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            MyView 采用纯私密图谱，不支持公共模糊搜索。
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
              type="text"
              required
              className="flex-1 rounded-lg border p-2 text-xs focus:outline-none focus:border-slate-400 font-mono"
              placeholder="输入好友的唯一用户名"
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
                variant="default"
                className="text-xs h-7"
                onClick={() => sendRequest(searchResult.id)}
              >
                + 建立密友连线
              </Button>
            </div>
          )}
        </div>

        {/* 待审批区 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">
            ⏳ 密友申请通知 ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 mt-3">
              暂无收到的待确认密友申请。
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 flex flex-col gap-2"
                >
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">
                      {(req.profiles as any)?.display_name}
                    </span>
                    <span className="text-slate-400 font-mono block">
                      @{(req.profiles as any)?.username}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-[10px] h-6 flex-1 bg-slate-900 text-white"
                      onClick={() => respondRequest(req.id, true)}
                    >
                      接受
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-6 flex-1"
                      onClick={() => respondRequest(req.id, false)}
                    >
                      忽略
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧：坚实的密友名单列表 */}
      <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">
          👥 我的密友节点 ({friendsList.length})
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
                    {friend.display_name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    @{friend.username}
                  </p>
                </div>
                {/* 预留按钮：未来用于点击进去看这个好友分享出来的书影单 */}
                <Link href={`/friends/${friend.id}`}>
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
