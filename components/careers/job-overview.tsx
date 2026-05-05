type Props = {
  overview: string;
  responsibilities: string[];
  requirements: string[];
};

export default function JobOverview({
  overview,
  responsibilities,
  requirements,
}: Props) {
  return (
    <div className="space-y-12">

      {/* 🔹 OVERVIEW */}
      <Section title="Overview">
        <p className="text-white/70 leading-[1.8] text-[15px]">
          {overview}
        </p>
      </Section>

      {/* 🔹 RESPONSIBILITIES */}
      <Section title="Key Responsibilities">
        <ul className="space-y-4">
          {responsibilities.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-white/70 text-[15px] leading-[1.7]">
              
              {/* subtle luxury bullet */}
              <span className="mt-[6px] w-[6px] h-[6px] rounded-full bg-gradient-to-r from-[#6C8CFF] to-[#D4AF37]" />
              
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 🔹 REQUIREMENTS */}
      <Section title="Skills & Experience">
        <ul className="space-y-4">
          {requirements.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-white/70 text-[15px] leading-[1.7]">
              
              <span className="mt-[6px] w-[6px] h-[6px] rounded-full bg-white/40" />
              
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

    </div>
  );
}

/* 🔹 REUSABLE SECTION (this is the key upgrade) */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">

      {/* subtle top divider glow */}
      <div className="absolute -top-6 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div
        className="
          rounded-2xl
          border border-white/10
          bg-white/[0.02]
          backdrop-blur-xl
          p-6 md:p-7
        "
      >
        {/* TITLE */}
        <div className="mb-5">
          <h3 className="text-[17px] font-medium tracking-tight">
            {title}
          </h3>

          {/* accent line */}
          <div className="mt-2 h-[1px] w-10 bg-gradient-to-r from-[#6C8CFF] to-transparent" />
        </div>

        {/* CONTENT */}
        <div>{children}</div>
      </div>
    </section>
  );
}