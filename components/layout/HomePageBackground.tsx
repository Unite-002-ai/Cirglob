"use client";

import type { ReactNode } from "react";

export default function HomePageBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#03040A] text-white">
      {/* Global background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        
        {/* Core gradient (darker + tighter) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,124,255,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.02),transparent_35%),linear-gradient(180deg,#03040A_0%,#02030A_100%)]" />

        {/* Grid (more subtle) */}
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:100px_100px]" />

        {/* LEFT DARK EDGE */}
        <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#02030A] via-[#02030A]/80 to-transparent" />

        {/* RIGHT DARK EDGE */}
        <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#02030A] via-[#02030A]/80 to-transparent" />

        {/* Controlled glow (less aggressive) */}
        <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[650px] w-[650px] rounded-full bg-purple-500/10 blur-[200px]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}