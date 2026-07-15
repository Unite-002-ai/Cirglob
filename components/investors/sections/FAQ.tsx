import React from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "Is there a fee to join the investor network?",
    answer:
      "No. Access to the Cirglob Investor Network is not fee-based. Selection is based on qualification and alignment.",
  },
  {
    question: "Is access guaranteed after applying?",
    answer:
      "No. All applications are individually reviewed. Only qualified profiles are invited into the network.",
  },
  {
    question: "Who can apply globally?",
    answer:
      "Yes. Cirglob accepts applications from global investors, subject to eligibility and review standards.",
  },
  {
    question: "What type of startups are included?",
    answer:
      "The network focuses on curated, early to growth-stage startups across technology, infrastructure, and emerging markets.",
  },
  {
    question: "How long does the review process take?",
    answer:
      "Typical review time is between 3–10 business days depending on application volume and profile depth.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative w-full py-24">
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-light tracking-wide text-white md:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/50 md:text-base">
            Clear answers for qualified investors evaluating access.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:border-white/16 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-6">
                <h3 className="text-sm font-medium leading-snug text-white md:text-base">
                  {item.question}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-xs tracking-wide text-white/40">
            Additional details are provided during the review process.
          </p>
        </div>
      </div>
    </section>
  );
}
