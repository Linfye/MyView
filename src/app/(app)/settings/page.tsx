"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAnimatedNotice } from "@/components/ui/animated-notice";
import { KeyRound, Settings } from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { notify, NoticeHost } = useAnimatedNotice();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name, bio, contact_info")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setDisplayName(profile.display_name || "");
        setBio(profile.bio || "");
        setContactInfo(profile.contact_info || "");
      }
      setFetching(false);
    }
    loadProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notify("登录状态已失效", "请重新登录后再保存。", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        bio: bio.trim(),
        contact_info: contactInfo.trim(),
      })
      .eq("id", user.id);

    if (error) {
      if (error.message.includes("unique")) {
        notify("更新失败", "该用户名已被他人占用，请换一个。", "error");
      } else {
        notify("更新失败", error.message, "error");
      }
      setLoading(false);
      return;
    }

    notify("资料已更新", "你的私人数字名片已经保存。", "success");
    setLoading(false);
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordLoading) return;

    if (newPassword.length < 6) {
      notify("密码太短", "新密码至少需要 6 个字符。", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("两次密码不一致", "请重新输入新密码。", "error");
      return;
    }

    setPasswordLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (signInError) {
      notify("旧密码不正确", "请确认当前密码后再试。", "error");
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      notify("密码修改失败", error.message, "error");
      setPasswordLoading(false);
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordLoading(false);
    notify("密码已更新", "下次登录请使用新密码。", "success");
  };

  if (fetching)
    return (
      <div className="text-center py-12 text-sm text-slate-400">
        正在调取个人资料...
      </div>
    );

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[1fr_0.9fr]">
      <NoticeHost />
      <form
        onSubmit={handleUpdateProfile}
        className="app-surface rounded-2xl p-5 space-y-5 sm:p-7"
      >
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 tracking-tight">
            <Settings className="size-5 text-teal-700" />
            个人资料设置
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            管理你的私人数字名片，朋友间可见。
          </p>
        </div>

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
            方便朋友在其他平台精准锁定你并取得联系。
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

      <form
        onSubmit={handleChangePassword}
        className="app-surface rounded-2xl p-5 space-y-5 sm:p-7"
      >
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <KeyRound className="size-5 text-teal-700" />
            修改密码
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            输入旧密码验证身份，然后设置新密码。
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">
            当前密码
          </label>
          <input
            type="password"
            required
            className="mt-1 w-full field-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">
            新密码
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 w-full field-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">
            再次输入新密码
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="mt-1 w-full field-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="border-t pt-4 flex justify-end">
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "正在更新..." : "更新密码"}
          </Button>
        </div>
      </form>
    </div>
  );
}
