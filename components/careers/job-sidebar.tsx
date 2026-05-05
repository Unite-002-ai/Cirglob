type Props = {
  title: string;
  location: string;
  type: string;
  department: string;
  salary: string;
};

export default function JobSidebar({
  title,
  location,
  type,
  department,
  salary,
}: Props) {
  return (
    <aside className="sticky top-20 h-[calc(100vh-100px)]">

      <div
        className="
          relative h-full
          rounded-3xl
          border border-white/10
          bg-gradient-to-b from-white/[0.05] to-white/[0.02]
          backdrop-blur-2xl
          p-8
          flex flex-col justify-between
        "
      >

        {/* ✨ subtle glow layer */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-[#6C8CFF]/10 blur-[120px]" />
          <div className="absolute bottom-[-60px] right-[-40px] w-[260px] h-[260px] bg-[#D4AF37]/10 blur-[120px]" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 space-y-10">

          {/* TITLE */}
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight leading-snug">
              {title}
            </h2>

            <div className="mt-2 h-[1px] w-12 bg-gradient-to-r from-[#6C8CFF] to-transparent" />
          </div>

          {/* META */}
          <div className="space-y-6 text-[14px]">

            <Info label="Location" value={location} />
            <Info label="Employment Type" value={type} />
            <Info label="Department" value={department} />
            <Info label="Compensation" value={salary} />

            <Info label="Work Model" value="Hybrid / Remote-flexible" />
            <Info label="Timezone" value="Global (async-first)" />

          </div>

        </div>

        {/* FOOT NOTE (bottom anchor) */}
        <div className="relative z-10 text-xs text-white/30 leading-relaxed">
          Cirglob operates globally. Role expectations and compensation may vary
          depending on location and experience.
        </div>

      </div>
    </aside>
  );
}

/* 🔹 Clean Info Row */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-white/40 text-[11px] uppercase tracking-wide">
        {label}
      </span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}