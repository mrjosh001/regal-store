import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function safePath(next: string | null) {
  if (!next) return null;
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safePath(searchParams.get("next"));
  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error");

  // Invalid / expired link from provider
  if (errorCode || errorDescription) {
    const lower = `${errorCode || ""} ${errorDescription || ""}`.toLowerCase();
    let status = "error";
    if (lower.includes("expired") || lower.includes("otp_expired")) status = "expired";
    else if (lower.includes("invalid") || lower.includes("not found")) status = "invalid";
    return NextResponse.redirect(`${origin}/sign-in?confirm=${status}`);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // OAuth / intentional post-login destination
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Email confirmation (no next) → clear session, show success on sign-in
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/sign-in?confirm=success`);
    }
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("expired")) {
      return NextResponse.redirect(`${origin}/sign-in?confirm=expired`);
    }
    return NextResponse.redirect(`${origin}/sign-in?confirm=error`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email" | "invite" | "magiclink" | "recovery" | "email_change",
    });
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
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
