import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_items")
    .select(
      `
      id,
      type,
      title,
      creator,
      year,
      rating,
      status,
      visibility,
      short_review,
      long_review,
      viewed_at,
      time_precision,
      created_at,
      canonical_works (
        canonical_id,
        type,
        title_en,
        title_zh,
        original_title,
        creator_name,
        original_language,
        first_published_year
      )
    `,
    )
    .eq("user_id", session.user.id)
    .order("viewed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        item_count: data?.length || 0,
        items: data || [],
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="myview-archive.json"`,
      },
    },
  );
}
