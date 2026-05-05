import { ReactNode } from "react";

type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function LegalSection({
  id,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 py-16 md:py-20 border-b border-white/5"
    >
      {/* Container */}
      <div className="max-w-[900px] mx-auto px-6">

        {/* Section Title */}
        <h2 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-white mb-6">
          {title}
        </h2>

        {/* Content Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 leading-[1.75] text-gray-300 text-[15px] md:text-[16px] space-y-5">

          {children}

        </div>
      </div>
    </section>
  );
}