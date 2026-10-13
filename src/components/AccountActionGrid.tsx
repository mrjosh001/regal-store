import Link from "next/link";

const actions = [
  { href: "/cart", icon: "🛒", title: "Your cart", desc: "Review items before ordering", bg: "bg-[#eef2f8]" },
  { href: "/account/track", icon: "📦", title: "Track an order", desc: "Check delivery updates", bg: "bg-[#f0eee6]" },
  { href: "/account/addresses", icon: "⌖", title: "Delivery addresses", desc: "Review your saved details", bg: "bg-[#edf1eb]" },
  { href: "/custom-order", icon: "✨", title: "Custom request", desc: "Ask us to source a piece", bg: "bg-[#f7efe6]" },
  { href: "/account/help", icon: "?", title: "Help centre", desc: "Sizing, orders and support", bg: "bg-[#eef0f4]" },
  { href: "/account/change-password", icon: "🔒", title: "Change password", desc: "Update your sign-in security", bg: "bg-[#f4e9df]" },
  { href: "/account/support", icon: "♡", title: "Customer support", desc: "Get help with a request", bg: "bg-[#f4e9df]" },
  { href: "/", icon: "⌂", title: "Back to shop", desc: "Continue browsing the store", bg: "bg-[#edf1eb]" },
];

export default function AccountActionGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((item) => (
        <Link
          key={item.href + item.title}
          href={item.href}
          className="group flex items-center gap-4 rounded-[20px] border border-[#e6e4dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${item.bg}`}>
            {item.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{item.title}</span>
            <span className="mt-1 block text-xs text-[#83887f]">{item.desc}</span>
          </span>
          <span className="text-lg text-[#9aa095] transition group-hover:translate-x-1">→</span>
        </Link>
      ))}
    </div>
  );
}
