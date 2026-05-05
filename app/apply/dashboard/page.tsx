"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ---------------- LOGO ---------------- */
function CirglobLogo() {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 5;

  return (
    <svg
      width="30"
      height="36"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cg-main" x1="14" y1="12" x2="50" y2="52">
          <stop offset="0%" stopColor="#4AA8FF" />
          <stop offset="55%" stopColor="#5B6CFF" />
          <stop offset="100%" stopColor="#7D3DFF" />
        </linearGradient>
      </defs>

      <path
        d="M46 20 A20 20 0 1 0 46 44"
        stroke="url(#cg-main)"
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${circumference - gapSize} ${gapSize}`}
        strokeDashoffset={circumference * 0.35}
      />
    </svg>
  );
}

/* ---------------- PAGE ---------------- */
export default function ApplyDashboardPage() {
  const [hasDraft, setHasDraft] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem("cirglob-application-draft");
    const savedProgress = localStorage.getItem("cirglob-application-progress");

    if (draft) setHasDraft(true);
    if (savedProgress) setProgress(Number(savedProgress));
  }, []);

  const handleReset = () => {
    localStorage.removeItem("cirglob-application-draft");
    localStorage.removeItem("cirglob-application-progress");
    setHasDraft(false);
    setProgress(0);
    setShowResetConfirm(false);
  };

  return (
    <main className="relative h-[100svh] w-full bg-[#05060A] text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[800px] h-[800px] bg-purple-500/10 blur-[220px] rounded-full" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 h-full max-w-7xl mx-auto w-full px-6 py-8 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <CirglobLogo />
            <p className="text-xs tracking-[0.3em] uppercase text-white/40">
              Cirglob Application
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-8 flex-1 min-h-0 grid grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="col-span-8 flex flex-col gap-6 min-h-0">
            {/* MAIN CARD */}
            <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Founder Application</h2>

                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    Summer 2026
                  </span>
                </div>

                {/* PROGRESS */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-white/50 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-white">
                    {hasDraft ? "In Progress" : "Not Started"}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex gap-3 relative">
                <Link
                  href="/apply/application"
                  className="
                    px-6 py-3 rounded-full
                    bg-gradient-to-r from-blue-500 to-purple-600
                    text-white text-sm font-medium
                    hover:scale-[1.02]
                    transition
                  "
                >
                  {hasDraft ? "Continue" : "Start Application"}
                </Link>

                <button
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="
                    px-6 py-3 rounded-full
                    border border-white/10
                    bg-white/5
                    text-sm text-white/70
                    hover:bg-white/10
                    transition
                  "
                >
                  Reset
                </button>

                {showResetConfirm && (
                  <div className="absolute top-full mt-3 right-0 w-72 rounded-xl border border-white/10 bg-[#0B0D14] p-4 shadow-xl">
                    <p className="text-sm text-white">Reset application?</p>

                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      This will permanently remove your draft and progress. This action
                      cannot be undone.
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleReset}
                        className="flex-1 px-3 py-2 rounded-md bg-red-500/90 text-white text-xs hover:bg-red-500 transition"
                      >
                        Confirm Reset
                      </button>

                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-3 py-2 rounded-md bg-white/5 text-xs text-white/70 hover:bg-white/10 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK INFO */}
            <div className="grid grid-cols-3 gap-5 shrink-0">
              {[
                {
                  title: "Review",
                  text: "Rolling basis. 5–10 day response.",
                },
                {
                  title: "Focus",
                  text: "Execution, clarity, systems thinking.",
                },
                {
                  title: "Support",
                  text: "Mentors, investors, infrastructure.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-2 text-xs text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-4 flex flex-col gap-6 min-h-0">
            {/* DEADLINE */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs text-white/50 uppercase">Deadline</p>

              <p className="text-xl font-semibold mt-2">May 4 · 8:00 PM PT</p>

              <p className="text-sm text-gray-400 mt-2">Priority review window</p>
            </div>

            {/* HELP */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-sm font-medium">Help</h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>

                <Link href="/contact" className="hover:text-white transition">
                  Contact Support
                </Link>
              </div>
            </div>

            {/* SYSTEM NOTE */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <p className="text-sm text-white">System Status</p>

              <p className="text-sm text-gray-400 mt-2">
                Drafts save automatically. Continue anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}