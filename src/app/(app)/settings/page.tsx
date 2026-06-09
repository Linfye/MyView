"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [contactInfo, setContactInfo] = useState(""); // 🌟 新增状态

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setDisplayName(profile.display_name || "");
        setBio(profile.bio || "");
        setContactInfo(profile.contact_info || ""); // 🌟 回显联系方式
      }
      setFetching(false);
    }
    loadProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        bio: bio.trim(),
        contact_info: contactInfo.trim(), // 🌟 同步更新到数据库
      })
      .eq("id", user.id);

    if (error) {
      if (error.message.includes("unique")) {
        alert("更新失败：该用户名已被他人占用，请换一个。");
      } else {
        alert("更新失败：" + error.message);
      }
      setLoading(false);
      return;
    }

    alert("资料修改成功！");
    setLoading(false);
    router.refresh();
  };

  if (fetching)
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        正在调取个人资料...
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          ⚙️ 个人资料设置
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          在这里管理你的私人数字名片，密友间可见。
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-500">
            唯一用户名 ID (Username)
          </label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded-lg border p-2.5 text-sm font-mono focus:outline-none focus:border-slate-400"
            placeholder="仅限字母和数字，如 kuro"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            展示昵称 (Display Name)
          </label>
          <input
            type="text"
            required
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder="如：玄黑"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* 🌟 新增表单项：外部联系方式 🌟 */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            外部联系方式 (可选)
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder="微信: xxx / 邮箱: mail@example.com"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            方便密友在其他平台精准锁定你并取得联系。
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            数字自白 / 简介 (Bio)
          </label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:border-slate-400"
            placeholder="用几句话描述你的阅读/观影偏好..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="border-t pt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "正在保存..." : "保存修改"}
          </Button>
        </div>
      </form>
    </div>
  );
}
