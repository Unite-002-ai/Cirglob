'use client';
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, getCompanyBySlug } from "@/lib/work-at-startups-data";
import SalaryBadge from "@/components/work-at-startups/salary-badge";

export default function JobDetailPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = getJobById(params.jobId);

  if (!job) {
    notFound();
  }

  const company = getCompanyBySlug(job.companySlug);

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#7C8CFF]/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#D4AF37]/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative max-w-[1000px] mx-auto px-6 py-16">
        <Link
          href="/work-at-startups/jobs"
          className="text-sm text-white/50 hover:text-white transition"
        >
          ← Back to jobs
        </Link>

        <div className="mt-6">
          <p className="text-white/45 text-sm">
            {job.companyName} · {job.location} · {job.type}
          </p>

          <h1 className="mt-3 text-[40px] md:text-[54px] font-semibold tracking-tight leading-tight">
            {job.title}
          </h1>

          <div className="mt-4">
            <SalaryBadge
              min={job.salaryMin}
              max={job.salaryMax}
              highlight
              size="lg"
            />
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              href={`/work-at-startups/apply/${job.id}`}
              className="px-5 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Apply Now
            </Link>

            {company && (
              <Link
                href={`/work-at-startups/companies/${company.slug}`}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
              >
                View Company
              </Link>
            )}
          </div>
        </div>

        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-4">Role Overview</h2>
          <p className="text-white/65 leading-relaxed">{job.overview}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-4">Responsibilities</h2>
          <ul className="space-y-3 text-white/65">
            {job.responsibilities.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-[#7C8CFF]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-4">Requirements</h2>
          <ul className="space-y-3 text-white/65">
            {job.requirements.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-[#D4AF37]">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-4">Nice to Have</h2>
          <ul className="space-y-3 text-white/65">
            {job.niceToHave.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-white/50">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-4">Benefits</h2>
          <ul className="space-y-2 text-white/65 text-sm">
            {job.benefits.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14 text-center">
          <h2 className="text-xl font-medium">Ready to build with {job.companyName}?</h2>
          <p className="text-white/55 mt-2 text-sm">
            Apply now and connect directly with the founding team.
          </p>

          <div className="mt-6">
            <Link
              href={`/work-at-startups/apply/${job.id}`}
              className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Submit Application →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}