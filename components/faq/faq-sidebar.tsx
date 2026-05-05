// ===============================================
// FILE: components/faq/faq-sidebar.tsx
// ===============================================
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export default function FAQSidebar({
  categories,
  activeCategory,
  onChange,
}: Props) {
  return (
    <aside className="h-screen sticky top-0 flex flex-col justify-between px-6 py-8 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* TOP */}
      <div className="relative z-10">
        <Link href="/" className="block">
          <h1 className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition">
            Cirglob
          </h1>
        </Link>

        <p className="text-xs text-gray-500 mt-1 tracking-wide">
          Help & Support System
        </p>

        <div className="h-px bg-white/10 my-7" />

        <nav className="space-y-2">
          {categories.map((cat) => {
            const active = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onChange(cat)}
                className="relative w-full text-left px-4 py-3 rounded-xl text-sm transition"
              >
                {active && (
                  <>
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                    />
                    <motion.div
                      layoutId="active-line"
                      className="absolute left-0 top-2 bottom-2 w-[2px] bg-blue-500 rounded-full"
                    />
                  </>
                )}

                <span
                  className={`relative z-10 ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="relative z-10 border-t border-white/10 pt-6">
        <p className="text-xs text-gray-500">Launching from Egypt</p>
        <p className="text-xs text-gray-400 mt-1">Global founder system</p>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-300">
          Applications opening soon
        </div>
      </div>
    </aside>
  );
}