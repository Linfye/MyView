import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 创建一个在服务器端运行的 Supabase 连接器
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 如果在 Server Component 里调用，可以忽略 set 报错
          }
        },
      },
    },
  );
}
