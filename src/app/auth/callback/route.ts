import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Exchanges the email-confirmation code for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await getSupabaseServer();
    await supabase?.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/`);
}
