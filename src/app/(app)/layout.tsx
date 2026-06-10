import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <AppNav
            userId={session.user.id}
            initialDisplayName={initialName}
            initialLetter={initialLetter}
            signOutAction={signOutAction}
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-screen-2xl px-4 py-4 md:px-6 md:py-6">
        {children}
      </main>
    </div>
  );
}
