import React from "react";

export default function Standards() {
  return (
    <section id="standards" className="relative w-full py-24">
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white">
            Investment standards
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/50 max-w-2xl mx-auto">
            Cirglob is designed for qualified investors operating with
            experience, discipline, and long-term capital intent.
          </p>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <div className="space-y-6 text-center">
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              Membership is not open enrollment. Each application is evaluated
              individually based on experience, investment profile, and
              alignment with structured capital participation.
            </p>

            <div className="h-px w-full bg-white/10" />

            <p className="text-white/60 text-sm leading-relaxed">
              The Cirglob Investor Network prioritizes signal over scale —
              favoring depth of participation over breadth of access.
            </p>

            <div className="h-px w-full bg-white/10" />

            <p className="text-white/50 text-xs tracking-wide uppercase">
              No automatic approvals • No public listing • No open access
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-white text-sm font-medium">
              Experience required
            </h3>
            <p className="mt-2 text-white/50 text-xs leading-relaxed">
              Prior exposure to startup investing, venture ecosystems, or
              operational company building.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-white text-sm font-medium">
              Capital intent clarity
            </h3>
            <p className="mt-2 text-white/50 text-xs leading-relaxed">
              Defined allocation strategy with long-term participation mindset.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-white text-sm font-medium">Signal alignment</h3>
            <p className="mt-2 text-white/50 text-xs leading-relaxed">
              Preference for curated deal flow over high-volume or speculative
              access.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
        </div>
      </div>
    </section>
  );
}
