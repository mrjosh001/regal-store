import Link from "next/link";

type Action = {
  href: string;
  icon: string;
  title: string;
  desc: string;
  bg: string;
};

type Group = {
  label: string;
  items: Action[];
};

const groups: Group[] = [
  {
    label: "Shopping",
    items: [
      {
        href: "/cart",
        icon: "🛒",
        title: "Your cart",
        desc: "Review items before ordering",
        bg: "bg-[#eef2f8]",
      },
      {
        href: "/",
        icon: "⌂",
        title: "Back to shop",
        desc: "Continue browsing the store",
        bg: "bg-[#edf1eb]",
      },
    ],
  },
  {
    label: "Orders",
    items: [
      {
        href: "/account/track",
        icon: "📦",
        title: "Track an order",
        desc: "Check delivery updates",
        bg: "bg-[#f0eee6]",
      },
      {
        href: "/custom-order",
        icon: "✨",
        title: "Custom request",
        desc: "Ask us to source a piece",
        bg: "bg-[#f7efe6]",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: "/account/addresses",
        icon: "⌖",
        title: "Delivery addresses",
        desc: "Review your saved details",
        bg: "bg-[#edf1eb]",
      },
      {
        href: "/account/change-password",
        icon: "🔒",
        title: "Change password",
        desc: "Update your sign-in security",
        bg: "bg-[#f4e9df]",
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        href: "/account/help",
        icon: "?",
        title: "Help centre",
        desc: "Sizing, orders and support",
        bg: "bg-[#eef0f4]",
      },
      {
        href: "/account/support",
        icon: "♡",
        title: "Customer support",
        desc: "Get help with a request",
        bg: "bg-[#f4e9df]",
      },
    ],
  },
];

function ActionRow({ item }: { item: Action }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3.5 border-b border-[#efeee8] px-4 py-3.5 last:border-b-0 active:bg-[#f7f5f0]"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${item.bg}`}
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[#202a23]">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-[#83887f]">{item.desc}</span>
      </span>
      <span className="text-base text-[#b0b5ad] transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export default function AccountActionGrid() {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.label}>
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#a65f3e]">
            {group.label}
          </p>
          <div className="overflow-hidden rounded-[20px] border border-[#e6e4dc] bg-white">
            {group.items.map((item) => (
              <ActionRow key={item.href + item.title} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
