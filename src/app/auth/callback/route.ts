import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error");

  // Supabase may send error params on the redirect when the link is invalid/expired
  if (errorCode || errorDescription) {
    const lower = `${errorCode || ""} ${errorDescription || ""}`.toLowerCase();
    let status = "error";
    if (lower.includes("expired") || lower.includes("otp_expired")) status = "expired";
    else if (lower.includes("invalid") || lower.includes("not found")) status = "invalid";
    return NextResponse.redirect(`${origin}/sign-in?confirm=${status}`);
  }

  const supabase = await createClient();

  // PKCE / code exchange (email confirm + OAuth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Email confirmation: send user to sign-in with success (they can sign in cleanly)
      // OAuth users also land here — if they already have a session, still ok to show confirmed
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/sign-in?confirm=success`);
    }
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("expired")) {
      return NextResponse.redirect(`${origin}/sign-in?confirm=expired`);
    }
    return NextResponse.redirect(`${origin}/sign-in?confirm=error`);
  }

  // token_hash flow (some email templates)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email" | "invite" | "magiclink" | "recovery" | "email_change",
    });
    if (!error) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/sign-in?confirm=success`);
    }
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("expired")) {
      return NextResponse.redirect(`${origin}/sign-in?confirm=expired`);
    }
    return NextResponse.redirect(`${origin}/sign-in?confirm=invalid`);
  }

  return NextResponse.redirect(`${origin}/sign-in?confirm=error`);
}
