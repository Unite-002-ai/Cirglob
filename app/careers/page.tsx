"use client";

import Link from "next/link";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[200px] rounded-full" />
      </div>

      {/* subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px)] bg-[size:28px_28px]" />

      {/* ================= HERO ================= */}
      <section className="relative max-w-6xl mx-auto px-6 pt-[140px] pb-[90px] text-center">

        <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
          Cirglob Careers
        </p>

        <h1 className="mt-6 text-[44px] md:text-[64px] font-semibold leading-[1.05] tracking-tight">
          Build the infrastructure of the
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6C8CFF] to-[#D4AF37]">
            AI-first world
          </span>
        </h1>

        <p className="mt-6 text-[16px] md:text-[18px] text-gray-400 max-w-2xl mx-auto leading-[1.7]">
          Cirglob is a venture firm and accelerator building systems, tools,
          and companies that redefine how intelligence is deployed globally.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/careers/jobs"
            className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition"
          >
            See Open Roles
          </Link>

          <Link
            href="/about"
            className="px-6 py-3 rounded-full border border-white/15 text-white/80 hover:text-white hover:bg-white/5 transition"
          >
            Learn About Cirglob
          </Link>
        </div>
      </section>

      {/* ================= WHAT WE BUILD ================= */}
      <section className="relative max-w-6xl mx-auto px-6 py-[90px]">

        <h2 className="text-center text-[28px] md:text-[34px] font-semibold mb-12">
          What we are building
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {[
            {
              title: "Venture Building",
              desc: "We create and scale startups from zero to global systems.",
            },
            {
              title: "AI Infrastructure",
              desc: "Core systems powering intelligence across Cirglob ecosystem.",
            },
            {
              title: "Startup Acceleration",
              desc: "We help founders go from idea to global execution.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition"
            >
              <h3 className="text-white font-medium text-[16px]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-gray-400 leading-[1.6]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY CIRGLOB ================= */}
      <section className="max-w-5xl mx-auto px-6 py-[90px] text-center">

        <h2 className="text-[28px] md:text-[34px] font-semibold">
          Why Cirglob
        </h2>

        <div className="mt-10 grid md:grid-cols-2 gap-6 text-left">

          {[
            "Small elite team with high ownership",
            "AI-native workflows by default",
            "Global-first builder mindset",
            "Extreme execution speed",
          ].map((item) => (
            <div
              key={item}
              className="p-5 rounded-xl border border-white/10 bg-white/[0.02] text-gray-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= CULTURE ================= */}
      <section className="max-w-5xl mx-auto px-6 py-[90px]">

        <h2 className="text-center text-[28px] md:text-[34px] font-semibold mb-10">
          Culture principles
        </h2>

        <div className="space-y-4 text-center text-gray-400">

          {[
            "Move like a founder, not an employee",
            "Ship before you perfect",
            "AI is default, not optional",
            "Global thinking only",
          ].map((p) => (
            <p key={p} className="text-[15px]">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ================= TEAM PREVIEW ================= */}
      <section className="max-w-6xl mx-auto px-6 py-[90px]">

        <h2 className="text-center text-[28px] md:text-[34px] font-semibold mb-12">
          Team
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {["Founders", "Engineers", "Investors", "Operators"].map((role) => (
            <div
              key={role}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center hover:bg-white/[0.05] transition"
            >
              <p className="text-white font-medium">{role}</p>
              <p className="text-xs text-gray-500 mt-2">
                Building Cirglob ecosystem
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="max-w-5xl mx-auto px-6 py-[120px] text-center">

        <h2 className="text-[32px] md:text-[40px] font-semibold">
          Ready to build Cirglob with us?
        </h2>

        <div className="mt-8">
          <Link
            href="/careers/jobs"
            className="px-7 py-3 rounded-full bg-gradient-to-r from-[#6C8CFF] to-[#D4AF37] text-black font-medium"
          >
            View Open Positions
          </Link>
        </div>
      </section>

    </main>
  );
}