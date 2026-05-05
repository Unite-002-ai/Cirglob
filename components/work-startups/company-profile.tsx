"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
};

type Founder = {
  name: string;
  role: string;
  background: string;
  avatar?: string;
};

type Company = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  longDescription?: string;
  batch: string;
  stage: string;
  industry: string;
  website: string;
  location?: string;
  remote: boolean;
  tags: string[];
  activeJobs: number;
  founders?: Founder[];
  jobs?: Job[];
  news?: string[];
};

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_40px_rgba(108,140,255,0.08)]">
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-300">
      {children}
    </span>
  );
}

export default function CompanyProfile({ company }: { company: Company }) {
  const [activeTab, setActiveTab] = useState<"about" | "jobs" | "news">(
    "about"
  );

  return (
    <div className="min-h-screen bg-[#05060A] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-semibold">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-10 h-10 rounded-lg"
                />
              ) : (
                company.name.slice(0, 2)
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {company.name}
              </h1>
              <p className="text-gray-400 text-sm">
                {company.description}
              </p>

              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge>{company.batch}</Badge>
                <Badge>{company.stage}</Badge>
                <Badge>{company.industry}</Badge>
                {company.remote && <Badge>Remote-first</Badge>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={company.website}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Visit Website
            </a>

            <Link
              href={`/work-at-startups/jobs?company=${company.slug}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              View Jobs
            </Link>
          </div>
        </motion.div>

        {/* STATS BAR */}
        <GlassCard>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <Stat label="Active Jobs" value={company.activeJobs} />
            <Stat label="Batch" value={company.batch} />
            <Stat label="Stage" value={company.stage} />
            <Stat label="Remote" value={company.remote ? "Yes" : "No"} />
          </div>
        </GlassCard>

        {/* NAV TABS */}
        <div className="flex gap-2 border-b border-white/10 pb-3">
          {["about", "jobs", "news"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <GlassCard>
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-medium">About</h2>
                <p className="text-gray-300 leading-relaxed">
                  {company.longDescription ||
                    "This startup is building category-defining technology backed by Cirglob’s elite ecosystem. Focused on scaling innovation across global markets."}
                </p>
              </div>
            </GlassCard>

            {/* FOUNDERS */}
            {company.founders?.length ? (
              <GlassCard>
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-medium">Founders</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {company.founders.map((f, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="font-medium">{f.name}</div>
                        <div className="text-sm text-gray-400">
                          {f.role}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {f.background}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ) : null}
          </motion.div>
        )}

        {/* JOBS */}
        {activeTab === "jobs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <GlassCard>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">
                  Open Roles at {company.name}
                </h2>

                <div className="space-y-3">
                  {company.jobs?.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-gray-400">
                          {job.department} • {job.location}
                        </div>
                      </div>

                      <Link
                        href={`/work-at-startups/jobs/${job.id}`}
                        className="px-4 py-2 rounded-lg bg-[#6C8CFF] text-black text-sm font-medium hover:opacity-90"
                      >
                        Apply
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* NEWS */}
        {activeTab === "news" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GlassCard>
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-medium">Latest Updates</h2>

                <ul className="space-y-3">
                  {(company.news || [
                    "Raised seed round from top-tier investors",
                    "Launched first version of core product",
                    "Hired founding engineering team",
                  ]).map((n, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-300 border-l border-white/10 pl-3"
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ---------------------- */
/* SMALL INTERNAL COMPONENT */
/* ---------------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="text-xl font-semibold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}