import React from "react";

type AudienceItem = {
  title: string;
  description: string;
  note?: string;
};

const AUDIENCE: AudienceItem[] = [
  {
    title: "Angel Investors",
    description:
      "Individuals deploying capital into early-stage companies with long-term conviction.",
    note: "High-signal participation preferred",
  },
  {
    title: "Venture Funds",
    description:
      "Institutional investors seeking curated deal flow and structured exposure to emerging startups.",
    note: "Fund-level allocation mindset",
  },
  {
    title: "Family Offices",
    description:
      "Multi-generational capital allocating across innovation, technology, and private markets.",
    note: "Long-horizon strategy alignment",
  },
  {
    title: "Operators",
    description:
      "Founders, executives, and builders investing alongside operational expertise.",
    note: "Execution-aware capital",
  },
  {
    title: "Strategic Investors",
    description:
      "Capital partners aligned with ecosystem expansion, partnerships, or domain synergy.",
    note: "Value beyond capital",
  },
];

export default function Audience() {
  return (
    <section id="audience" className="relative w-full py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white">
            Built for selective capital partners
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/50 max-w-2xl mx-auto">
            Cirglob is structured for experienced investors seeking curated
            access, not open participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIENCE.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/16 hover:bg-white/[0.05]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-xl" />
              </div>

              <div className="relative">
                <h3 className="text-white text-base font-medium tracking-wide">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {item.description}
                </p>

                {item.note && (
                  <div className="mt-4 text-xs tracking-wide text-white/40">
                    {item.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
        </div>
      </div>
    </section>
  );
}
