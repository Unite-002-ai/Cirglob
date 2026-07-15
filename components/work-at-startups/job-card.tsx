import Link from "next/link";
import type { Job } from "@/lib/work-at-startups-data";

type JobCardProps = Job;

export default function JobCard({
  id,
  companyName,
  companySlug,
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
    <div className="group relative w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(124,140,255,0.1)]">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-[#7C8CFF]/5 via-transparent to-[#D4AF37]/5 pointer-events-none" />

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/work-at-startups/companies/${companySlug}`}
            className="text-sm font-medium text-white hover:text-[#AAB4FF] transition"
          >
            {companyName}
          </Link>
        </div>

        <div className="text-[11px] text-white/50">
          {remote ? "Remote" : location}
        </div>
      </div>

      <Link
        href={`/work-at-startups/jobs/${id}`}
        className="block text-lg font-semibold text-white hover:text-[#AAB4FF] transition"
      >
        {title}
      </Link>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
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

      <p className="mt-3 text-sm text-white/55 leading-[1.6] line-clamp-2">
        {description}
      </p>

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

      <div className="mt-5 flex items-center justify-between">
        <Link
          href={`/work-at-startups/jobs/${id}`}
          className="text-xs text-white/45 hover:text-white transition"
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
