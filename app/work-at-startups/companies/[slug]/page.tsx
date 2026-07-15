//work-at-startups/companies/[slug]/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyBySlug, getJobsByCompanySlug } from "@/lib/work-at-startups-data";
import SalaryBadge from "@/components/work-at-startups/salary-badge";

export default function CompanyProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const company = useMemo(() => {
    if (!slug) return undefined;
    return getCompanyBySlug(slug);
  }, [slug]);

  const jobs = useMemo(() => {
    if (!slug) return [];
    return getJobsByCompanySlug(slug);
  }, [slug]);

  const [activeTab, setActiveTab] = useState<"about" | "jobs" | "news">("about");

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060A] text-white">
        Company not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#7C8CFF]/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#D4AF37]/8 blur-[200px] rounded-full" />
      </div>

      <div className="relative max-w-[1120px] mx-auto px-6 py-10">
        <Link
          href="/work-at-startups/companies"
          className="text-sm text-white/50 hover:text-white transition"
        >
          ← Back to Companies
        </Link>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-semibold overflow-hidden">
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg" />
              ) : (
                company.name.slice(0, 2)
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                {company.name}
              </h1>
              <p className="text-white/50 text-sm mt-1">{company.description}</p>

              <div className="flex gap-2 mt-3 flex-wrap">
                {company.batch && <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-300">{company.batch}</span>}
                {company.stage && <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-300">{company.stage}</span>}
                {company.sector && <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-300">{company.sector}</span>}
                {company.remote && <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-300">Remote-first</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
              >
                Visit Website
              </a>
            )}

            <Link
              href={`/work-at-startups/jobs?company=${company.slug}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              View Jobs
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          <Stat label="Active Jobs" value={company.activeJobs} />
          <Stat label="Batch" value={company.batch} />
          <Stat label="Stage" value={company.stage} />
          <Stat label="Remote" value={company.remote ? "Yes" : "No"} />
        </div>

        <div className="mt-8 flex gap-2 border-b border-white/10 pb-3">
          {(["about", "jobs", "news"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "about" && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-medium mb-3">About</h2>
              <p className="text-white/65 leading-relaxed">
                {company.longDescription || company.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h2 className="text-lg font-medium mb-3">Mission</h2>
              <p className="text-white/65 leading-relaxed">{company.mission}</p>
            </div>

            {company.founders?.length ? (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-lg font-medium mb-4">Founders</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {company.founders.map((f) => (
                    <div key={f.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-sm text-white/50">{f.role}</div>
                      <div className="text-xs text-white/40 mt-2">{f.background}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-medium mb-4">Open Roles at {company.name}</h2>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-white/45">
                      {job.department} • {job.location}
                    </div>
                    <div className="mt-2">
                      <SalaryBadge
                        min={job.salaryMin}
                        max={job.salaryMax}
                        highlight
                      />
                    </div>
                  </div>

                  <Link
                    href={`/work-at-startups/jobs/${job.id}`}
                    className="px-4 py-2 rounded-lg bg-[#7C8CFF] text-black text-sm font-medium hover:opacity-90"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-medium mb-4">Latest Updates</h2>
            <ul className="space-y-3">
              {(company.news || []).map((item) => (
                <li key={item} className="text-sm text-white/65 border-l border-white/10 pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-white/45">{label}</div>
    </div>
  );
}