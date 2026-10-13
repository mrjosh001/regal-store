export default function LandingMarquee() {
  const items = [
    "Clothing",
    "Bags",
    "Shoes",
    "Curated finds",
    "WhatsApp ordering",
    "Personal sourcing",
    "Everyday style",
  ];
  const line = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-[#e8e0d5] bg-[#1a2820] py-4">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {line.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
              {item}
            </span>
            <span className="text-[#e8d5b5]/50" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
