"use client";

import { useState } from "react";

type Props = {
  overview: React.ReactNode;
  application: React.ReactNode;
};

export default function JobTabs({ overview, application }: Props) {
  const [tab, setTab] = useState<"overview" | "application">("overview");

  return (
    <div className="space-y-10">

      {/* 🔹 Tabs Container */}
      <div className="relative">

        {/* subtle top glow */}
        <div className="absolute -top-6 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div
          className="
            inline-flex items-center gap-2
            rounded-2xl
            border border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            p-1.5
          "
        >
          <TabButton
            label="Overview"
            active={tab === "overview"}
            onClick={() => setTab("overview")}
          />

          <TabButton
            label="Application"
            active={tab === "application"}
            onClick={() => setTab("application")}
          />
        </div>
      </div>

      {/* 🔹 Content */}
      <div className="relative">

        {/* subtle fade divider */}
        <div className="absolute -top-6 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="min-h-[300px] transition-all duration-300">
          {tab === "overview" ? overview : application}
        </div>
      </div>

    </div>
  );
}

/* 🔹 Tab Button (core upgrade) */
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300
        ${
          active
            ? "text-black"
            : "text-white/50 hover:text-white"
        }
      `}
    >
      {/* Active glass layer */}
      {active && (
        <span
          className="
            absolute inset-0
            rounded-xl
            bg-white
            shadow-[0_0_20px_rgba(255,255,255,0.15)]
          "
        />
      )}

      {/* subtle gradient hover */}
      {!active && (
        <span
          className="
            absolute inset-0
            rounded-xl
            opacity-0 hover:opacity-100
            transition
            bg-gradient-to-r from-white/10 to-white/5
          "
        />
      )}

      {/* text */}
      <span className="relative z-10">{label}</span>
    </button>
  );
}