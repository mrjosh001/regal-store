"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount } from "@/lib/cart";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/cart", label: "Cart", icon: "🛒" },
  { href: "/account", label: "Account", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount());
    function onCart() {
      setCount(cartCount());
    }
    window.addEventListener("cart-updated", onCart);
    return () => window.removeEventListener("cart-updated", onCart);
  }, []);

  // Hide on admin and auth pages
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 md:hidden safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 py-1 ${
                active ? "text-brand-blue" : "text-black/40"
              }`}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
              {link.href === "/cart" && count > 0 && (
                <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 bg-brand-blue text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
