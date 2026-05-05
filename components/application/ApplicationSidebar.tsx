"use client";

import Link from "next/link";
import clsx from "clsx";

type SectionKey =
  | "founders"
  | "video"
  | "company"
  | "progress"
  | "idea"
  | "equity"
  | "curious"
  | "batch";

interface SidebarItem {
  id: SectionKey;
  label: string;
}

const ITEMS: SidebarItem[] = [
  { id: "founders", label: "Founders" },
  { id: "video", label: "Founder Video" },
  { id: "company", label: "Company" },
  { id: "progress", label: "Progress" },
  { id: "idea", label: "Idea" },
  { id: "equity", label: "Equity" },
  { id: "curious", label: "Curious" },
  { id: "batch", label: "Batch Preference" },
];

type Props = {
  activeSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
};

export default function ApplicationSidebar({
  activeSection,
  onNavigate,
}: Props) {
  return (
    <aside className="sticky top-0 z-50 h-screen flex flex-col justify-between px-6 py-8 overflow-hidden bg-black/20 backdrop-blur-xl">
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* TOP */}
      <div className="relative z-10 min-h-0">
        <Link href="/" className="block">
          <h1 className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition">
            Cirglob
          </h1>
        </Link>

        <p className="text-xs text-gray-500 mt-1 tracking-wide">
          Founder Application
        </p>

        <div className="h-px bg-white/10 my-7" />

        <nav className="space-y-2">
          {ITEMS.map((item) => {
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={clsx(
                  "relative w-full text-left px-4 py-3 rounded-xl text-sm transition",
                  "border border-transparent",
                  "focus:outline-none focus:ring-0",
                  active
                    ? "bg-white/10 border-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {/* Active indicator (no layout shift) */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-blue-500" />
                )}

                <span className="relative z-10 block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM removed as requested */}
    </aside>
  );
}