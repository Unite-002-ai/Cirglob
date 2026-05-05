"use client";

import Link from "next/link";

type JobCardProps = {
  id: string;
  startupName: string;
  startupSlug?: string;
  startupBatch?: string;

  title: string;
  department: string;
  type: string;

  location: string;
  remote?: boolean;

  salaryMin?: number;
  salaryMax?: number;

  description: string;

  tags?: string[];
};

export default function JobCard({
  id,
  startupName,
  startupSlug,
  startupBatch,

  title,
  department,
  type,

  location,
  remote,

  salaryMin,
  salaryMax,

  description,
  tags = [],
}: JobCardProps) {
  return (
    <div className="group relative w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(108,140,255,0.08)]">

      {/* Glow Accent */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* TOP ROW — Startup + Meta */}
      <div className="flex items-center justify-between mb-3">

        <div className="flex items-center gap-2">
          <Link
            href={`/work-at-startups/companies/${startupSlug}`}
            className="text-sm font-medium text-white hover:text-blue-300 transition"
          >
            {startupName}
          </Link>

          {startupBatch && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
              {startupBatch}
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-500">
          {remote ? "Remote" : location}
        </div>
      </div>

      {/* JOB TITLE */}
      <Link
        href={`/work-at-startups/jobs/${id}`}
        className="block text-lg font-semibold text-white hover:text-blue-300 transition"
      >
        {title}
      </Link>

      {/* META INFO */}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
        <span>{type}</span>
        <span>•</span>
        <span>{department}</span>

        {salaryMin && salaryMax && (
          <>
            <span>•</span>
            <span className="text-[#D4AF37]">
              ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}
            </span>
          </>
        )}
      </div>

      {/* DESCRIPTION */}
      <p className="mt-3 text-sm text-gray-400 leading-[1.6] line-clamp-2">
        {description}
      </p>

      {/* TAGS */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-5 flex items-center justify-between">

        <Link
          href={`/work-at-startups/jobs/${id}`}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          View Details →
        </Link>

        <Link
          href={`/work-at-startups/apply/${id}`}
          className="text-xs px-4 py-2 rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
        >
          Apply
        </Link>

      </div>
    </div>
  );
}