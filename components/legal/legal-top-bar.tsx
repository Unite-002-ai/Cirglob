"use client";

import Link from "next/link";

const sections = [
  { id: "privacy-policy", label: "Privacy" },
  { id: "terms-of-use", label: "Terms" },
  { id: "trademarks", label: "Trademarks" },
];

export default function LegalTopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      
      {/* glow line (luxury SaaS touch) */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="w-full px-6 md:px-10 py-4 flex items-center justify-between">

        {/* LEFT — Brand (pinned left edge feel) */}
        <Link
          href="/"
          className="text-white font-semibold tracking-tight text-[15px]
                     hover:opacity-70 transition"
        >
          Cirglob
        </Link>

        {/* RIGHT — Navigation (pinned right) */}
        <nav className="flex items-center gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 rounded-full
                         border border-white/10 bg-white/5
                         text-white/70 hover:text-white
                         hover:bg-white/10 transition"
            >
              {s.label}
            </a>
          ))}
        </nav>

      </div>
    </header>
  );
}