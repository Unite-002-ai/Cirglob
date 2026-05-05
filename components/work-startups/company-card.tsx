"use client";

import { useRouter } from "next/navigation";

type CompanyCardProps = {
  id: string;
  slug: string;

  name: string;
  logo?: string;

  mission: string;

  batch: string; // e.g. W26
  stage: string; // Active / Seed / Series A etc
  sector?: string; // AI, HealthTech etc

  location?: string;
  remote?: boolean;

  activeJobs: number;

  website?: string;
};

export default function CompanyCard({
  slug,
  name,
  logo,
  mission,
  batch,
  stage,
  sector,
  location,
  remote,
  activeJobs,
}: CompanyCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/work-at-startups/companies/${slug}`)}
      className="
        group relative cursor-pointer
        rounded-2xl border border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        p-5
        transition-all duration-300
        hover:border-[#6C8CFF]/40
        hover:shadow-[0_0_40px_rgba(108,140,255,0.15)]
        hover:-translate-y-1
      "
    >
      {/* Glow accent */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6C8CFF]/10 via-transparent to-[#D4AF37]/10" />
      </div>

      {/* HEADER */}
      <div className="relative flex items-start justify-between gap-4">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white/60 text-sm font-semibold">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-white text-base font-semibold tracking-tight">
              {name}
            </h3>
            <p className="text-xs text-white/50">
              {sector || "Startup"} • {batch}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="
            px-2.5 py-1 rounded-full text-xs
            border border-[#6C8CFF]/30
            text-[#6C8CFF]
            bg-[#6C8CFF]/10
          "
        >
          {stage}
        </div>
      </div>

      {/* MISSION */}
      <p className="mt-4 text-sm text-white/70 leading-relaxed line-clamp-2">
        {mission}
      </p>

      {/* META INFO */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
        {location && (
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
            {location}
          </span>
        )}

        {remote && (
          <span className="px-2 py-1 rounded-md bg-[#6C8CFF]/10 border border-[#6C8CFF]/20 text-[#6C8CFF]">
            Remote
          </span>
        )}

        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
          {activeJobs} Open Roles
        </span>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-white/40">
          Click to explore company →
        </div>

        <button
          className="
            text-xs font-medium
            px-3 py-1.5 rounded-lg
            bg-white/5 border border-white/10
            text-white/80
            group-hover:border-[#6C8CFF]/40
            group-hover:text-white
            transition-all
          "
        >
          View Profile
        </button>
      </div>
    </div>
  );
}