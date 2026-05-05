"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  type: "Full-time" | "Contract";
  salary: string;
  description: string;
};

const JOBS: Job[] = [
  {
    id: "ai-infra-engineer",
    title: "AI Infrastructure Engineer",
    location: "London / Remote",
    department: "Engineering",
    type: "Full-time",
    salary: "$120K – $220K",
    description:
      "Build the core systems powering Cirglob’s AI-driven venture and startup ecosystem.",
  },
  {
    id: "venture-analyst",
    title: "Venture Analyst",
    location: "Remote",
    department: "Venture",
    type: "Full-time",
    salary: "$80K – $140K",
    description:
      "Evaluate startups and support global investment decisions.",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    location: "London",
    department: "Design",
    type: "Contract",
    salary: "$90K – $160K",
    description:
      "Design world-class experiences for founders and investors.",
  },
];

const departments = ["All", "Engineering", "Operations", "Design"];
const types = ["All", "Full-time", "Contract"];

export default function CareersJobsPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [type, setType] = useState("All");

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesQuery =
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());

      const matchesDept = dept === "All" || job.department === dept;
      const matchesType = type === "All" || job.type === type;

      return matchesQuery && matchesDept && matchesType;
    });
  }, [query, dept, type]);

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[180px] rounded-full" />
      </div>

      {/* Container */}
      <div className="relative max-w-[1100px] mx-auto px-6 py-16">

        {/* 🔷 BRAND HEADER */}
        <div className="flex items-center justify-between mb-10">

          <div className="flex items-center gap-3">
            {/* logo placeholder */}
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10" />

            <div>
              <p className="text-xs text-white/40">Careers at</p>
              <h1 className="text-xl font-medium tracking-tight">Cirglob</h1>
            </div>
          </div>

        </div>

        {/* HERO */}
        <div className="mb-10">
          <h2 className="text-[42px] md:text-[52px] font-semibold tracking-tight">
            Build the future of venture intelligence
          </h2>

          <p className="mt-4 text-white/50 max-w-2xl">
            Join a global AI-native team building infrastructure for founders, investors, and markets.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-full md:w-[320px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm"
          />

          <div className="flex gap-2 flex-wrap">

            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  dept === d
                    ? "bg-white text-black"
                    : "border-white/10 text-white/60"
                }`}
              >
                {d}
              </button>
            ))}

            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  type === t
                    ? "bg-white text-black"
                    : "border-white/10 text-white/60"
                }`}
              >
                {t}
              </button>
            ))}

          </div>
        </div>

        {/* JOB LIST */}
        <div className="mt-10 space-y-4">

          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/jobs/${job.id}`}
              className="block p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition"
            >
              <h3 className="text-lg font-medium">{job.title}</h3>

              <p className="text-sm text-white/50 mt-1">
                {job.location} · {job.department} · {job.type}
              </p>

              <p className="text-sm text-white/60 mt-3">
                {job.description}
              </p>

              <p className="text-sm text-white/80 mt-4">
                {job.salary}
              </p>
            </Link>
          ))}

        </div>

      </div>
    </main>
  );
}