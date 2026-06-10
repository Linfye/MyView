import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const initialName = "我的账户";
  const initialLetter = "M";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.10),transparent_28rem),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          <AppNav
            userId={session.user.id}
            initialDisplayName={initialName}
            initialLetter={initialLetter}
          />

          <div className="flex items-center gap-4">
            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/login");
              }}
            >
              <Button
                variant="outline"
                type="submit"
                className="h-10 rounded-xl border-red-100 bg-white px-4 text-sm font-semibold text-red-500 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-4" />
                退出
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-screen-2xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
