"use client";

import { useState } from "react";
import Link from "next/link";

type Action = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

type Group = {
  id: string;
  label: string;
  hint: string;
  items: Action[];
};

const groups: Group[] = [
  {
    id: "shopping",
    label: "Shopping",
    hint: "Cart and store",
    items: [
      {
        href: "/cart",
        icon: "🛒",
        title: "Your cart",
        desc: "Review items before ordering",
      },
      {
        href: "/",
        icon: "⌂",
        title: "Back to shop",
        desc: "Continue browsing the store",
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    hint: "Tracking, addresses & requests",
    items: [
      {
        href: "/account/track",
        icon: "📦",
        title: "Track an order",
        desc: "Check delivery updates",
      },
      {
        href: "/account/addresses",
        icon: "⌖",
        title: "Delivery addresses",
        desc: "Saved delivery details",
      },
      {
        href: "/custom-order",
        icon: "✨",
        title: "Custom request",
        desc: "Ask us to source a piece",
      },
    ],
  },
  {
    id: "help",
    label: "Help",
    hint: "Support and FAQs",
    items: [
      {
        href: "/account/help",
        icon: "?",
        title: "Help centre",
        desc: "Sizing, orders and support",
      },
      {
        href: "/account/support",
        icon: "♡",
        title: "Customer support",
        desc: "Get help with a request",
      },
    ],
  },
];

export default function AccountActionGrid() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = openId === group.id;
        return (
          <section
            key={group.id}
            className="overflow-hidden rounded-[20px] border border-[#e6e4dc] bg-white"
          >
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-4 py-4 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-[#202a23]">
                  {group.label}
                </span>
                <span className="mt-0.5 block text-xs text-[#83887f]">{group.hint}</span>
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f5f0] text-sm text-[#687168] transition ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-[#efeee8]">
                {group.items.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className="flex items-center gap-3.5 border-b border-[#efeee8] px-4 py-3.5 last:border-b-0 active:bg-[#f7f5f0]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f5f0] text-base">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#202a23]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#83887f]">{item.desc}</span>
                    </span>
                    <span className="text-[#b0b5ad]">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
