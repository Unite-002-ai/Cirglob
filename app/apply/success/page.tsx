"use client";

import Link from "next/link";
import CirglobBrand from "@/components/CirglobBrand"; // adjust path if needed

export default function ApplySuccessPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A] text-white">
      {/* BACKGROUND SYSTEM */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/6 blur-[180px]" />
        <div className="absolute bottom-[-25%] right-[-15%] h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[220px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />
      </div>

      {/* TOP NAV */}
      <header className="relative z-20 w-full">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-start px-6 py-6">
          <div className="-ml-10">
            <CirglobBrand />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6">
        <div className="w-full max-w-[720px] text-center">
          {/* STATUS */}
          <div className="mb-7 flex items-center justify-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-white/[0.08]
                bg-white/[0.02]
                px-4 py-2
                text-[10px]
                font-medium
                uppercase
                tracking-[0.28em]
                text-white/50
                backdrop-blur-sm
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              Submission Confirmed
            </div>
          </div>

          {/* HEADLINE */}
          <h1
            className="
              mx-auto
              max-w-[760px]
              text-[38px]
              font-semibold
              leading-[1.08]
              tracking-[-0.03em]
              text-white
              md:text-[56px]
            "
          >
            Your application has entered review.
          </h1>

          {/* BODY */}
          <div className="mx-auto mt-7 max-w-[620px] space-y-6">
            <p
              className="
                text-[15px]
                leading-[1.9]
                text-white/60
                md:text-[16px]
              "
            >
              Cirglob reviews companies across founder quality, execution
              ability, technical depth, market potential, and long-term
              strategic alignment.
            </p>

            <div className="space-y-3 text-sm text-white/38">
              <p>Reviews are conducted on a rolling basis.</p>

              <p>
                Founders selected to move forward will be contacted directly
                regarding next-stage evaluation.
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/apply/dashboard"
              className="
                inline-flex items-center justify-center
                rounded-full
                border border-white/[0.10]
                bg-white/[0.05]
                px-7 py-3.5
                text-sm
                font-medium
                text-white/88
                transition-all duration-300
                hover:border-white/[0.16]
                hover:bg-white/[0.07]
              "
            >
              Return to Dashboard
            </Link>

            <Link
              href="/apply/dashboard/submitted"
              className="
                inline-flex items-center justify-center
                rounded-full
                border border-white/[0.06]
                bg-transparent
                px-7 py-3.5
                text-sm
                font-medium
                text-white/48
                transition-all duration-300
                hover:border-white/[0.10]
                hover:bg-white/[0.03]
                hover:text-white/72
              "
            >
              Open Submitted Application
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}