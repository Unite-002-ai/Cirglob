"use client";

export default function MissionSection() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">
          Our Mission
        </p>

        <h2 className="text-[38px] font-semibold leading-[1.15] tracking-tight md:text-[54px]">
          Make global opportunity accessible to builders solving real-world problems.
        </h2>

        <p className="mt-8 text-[16px] leading-[1.8] text-white/55 md:text-[18px]">
          Cirglob is being built to connect ambitious founders with the resources they need
          to turn real problems into scalable companies.
          <br />
          <br />
          We focus on emerging markets where talent is strong, but access to investors,
          mentorship, and global visibility is limited.
          <br />
          <br />
          Our goal is to build a structured path from idea → validation → funding → global scaling.
        </p>

        <p className="mt-10 text-sm text-white/30">
          Applications will open in structured batches after launch.
        </p>

        <div className="mt-20 relative">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:34px_34px]" />

            <div className="relative z-10">
              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/35">
                Cirglob System
              </p>

              <div className="space-y-6 text-sm leading-relaxed text-white/65 md:text-base">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="font-medium text-blue-300">Founders</span>
                  <span className="text-white/25">→</span>
                  <span>Problem Validation</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-white/25">→</span>
                  <span>Mentorship</span>
                  <span className="text-white/25">→</span>
                  <span>Investor Discovery</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-white/25">→</span>
                  <span className="font-medium text-purple-200">Global Scaling</span>
                </div>
              </div>

              <div className="mt-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-white/35">
                A structured system designed to replace randomness in early-stage building
                with guided progression and clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}