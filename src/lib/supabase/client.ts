import { createBrowserClient } from "@supabase/ssr";

// 创建一个在浏览器（客户端）运行的 Supabase 连接器
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
