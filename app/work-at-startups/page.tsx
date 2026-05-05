"use client";

import { useState } from "react";
import Link from "next/link";
import CirglobBottomBar from "@/components/cirglob-bottom-bar";

type Job = {
  id: string;
  company: string;
  batch: string;
  mission: string;
  title: string;
  type: string;
  department: string;
  location: string;
  salary: string;
};

const ALL_JOBS: Job[] = [
  {
    id: "ml-engineer",
    company: "NovaMind",
    batch: "W26",
    mission: "AI operating system for healthcare",
    title: "ML Engineer",
    type: "Full-time",
    department: "Engineering",
    location: "Remote (US/EU)",
    salary: "$150K – $220K",
  },
  {
    id: "backend-engineer",
    company: "Orbit Labs",
    batch: "S26",
    mission: "Global logistics infrastructure powered by AI",
    title: "Backend Engineer",
    type: "Full-time",
    department: "Engineering",
    location: "London / Remote",
    salary: "$130K – $200K",
  },
  {
    id: "product-designer",
    company: "Quantix",
    batch: "W25",
    mission: "Financial intelligence for the AI era",
    title: "Product Designer",
    type: "Full-time",
    department: "Design",
    location: "NYC / Hybrid",
    salary: "$110K – $170K",
  },
];

export default function JobsPage() {
  const [search, setSearch] = useState("");

  const filteredJobs = ALL_JOBS.filter((job) => {
    const q = search.toLowerCase();

    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[180px] rounded-full" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-16">
          {/* Header */}
          <div className="max-w-[700px]">
            <h1 className="text-[36px] md:text-[48px] font-semibold tracking-tight">
              Startup Jobs
            </h1>

            <p className="mt-3 text-white/60">
              Discover roles at high-growth startups backed by Cirglob.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-10 sticky top-4 z-10 backdrop-blur-xl bg-[#05060A]/70 border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, companies, skills..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none"
              />

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {["Engineering", "Design", "Product", "Remote"].map((f) => (
                  <button
                    key={f}
                    className="px-3 py-2 text-xs rounded-lg border border-white/10 hover:bg-white/5 transition"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="mt-10 space-y-4">
            {filteredJobs.length === 0 && (
              <div className="text-white/50 text-sm">No jobs found.</div>
            )}

            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left */}
                  <div>
                    <div className="text-sm text-white/50">
                      {job.company} ({job.batch})
                    </div>

                    <div className="text-xs text-white/40 mt-1">
                      {job.mission}
                    </div>

                    <h3 className="text-lg font-medium mt-3">{job.title}</h3>

                    <div className="flex flex-wrap gap-3 text-xs text-white/50 mt-2">
                      <span>{job.type}</span>
                      <span>·</span>
                      <span>{job.department}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col md:items-end gap-3">
                    <div className="text-sm text-white/70">
                      {job.salary}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/work-at-startup/jobs/${job.id}`}
                        className="text-xs px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5 transition"
                      >
                        View Role
                      </Link>

                      <Link
                        href={`/work-at-startup/apply/${job.id}`}
                        className="text-xs px-4 py-2 rounded-lg bg-white text-black hover:opacity-90 transition"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 transition text-sm">
              Load More
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <CirglobBottomBar />
    </>
  );
}