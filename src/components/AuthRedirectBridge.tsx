"use client";

import { useEffect } from "react";

export default function AuthRedirectBridge() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const params = new URLSearchParams(search);
    const hasAuthCode = params.has("code") || params.has("token_hash");

    // Older Supabase confirmation links can return to the Site URL (for example
    // /?code=...) instead of the callback path. Route those links through the
    // server callback so the email confirmation is exchanged and the customer
    // is then sent to sign-in.
    if (hasAuthCode && pathname !== "/auth/callback") {
      window.location.replace(`/auth/callback${search}${hash}`);
    }
  }, []);

  return null;
}
