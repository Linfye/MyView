import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client"; // 确保指向你项目的 supabase 客户端路径

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 如果有下一个跳转目的地（比如去 dashboard），没有就默认去主页
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();

    // 💡 核心魔法：这一步会拿着邮件里的 code 去向 Supabase 换取真正的用户 Session 会话令牌
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 登录证件换取成功！极其优雅地重定向到系统内部看版
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 万一令牌过期或失败，安全地把用户退回到登录页
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
