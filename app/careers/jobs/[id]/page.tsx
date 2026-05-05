"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import JobSidebar from "@/components/careers/job-sidebar";
import JobTabs from "@/components/careers/job-tabs";
import JobOverview from "@/components/careers/job-overview";
import JobApplication from "@/components/careers/job-application";

const JOBS = [
  {
    id: "ai-infra-engineer",
    title: "AI Infrastructure Engineer",
    location: "London / Remote",
    department: "Engineering",
    type: "Full-time",
    salary: "$120K – $220K",
    overview:
      "Cirglob builds AI systems powering global venture intelligence.",
    responsibilities: [
      "Build scalable AI infrastructure",
      "Design venture intelligence systems",
      "Improve performance & observability",
    ],
    requirements: [
      "Strong backend engineering experience",
      "AI/ML system exposure",
      "Startup mindset",
    ],
  },
];

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const job = useMemo(() => {
    return JOBS.find((j) => j.id === jobId);
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060A] text-white">
        Job not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[180px]" />
      </div>

      {/* PAGE WRAP */}
      <div className="relative max-w-6xl mx-auto px-6 py-10">

        {/* 🔷 TOP BAR */}
        <div className="flex items-center justify-between mb-10">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10" />
            <div>
              <p className="text-xs text-white/40">Cirglob Careers</p>
              <p className="text-sm font-medium">{job.title}</p>
            </div>
          </div>

          {/* BACK BUTTON */}
          <Link
            href="/careers/jobs"
            className="text-sm text-white/50 hover:text-white transition"
          >
            ← Back to all roles
          </Link>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid md:grid-cols-[340px_1fr] gap-10">

          {/* SIDEBAR (sticky, always visible) */}
          <div className="sticky top-24 h-fit">
            <JobSidebar
              title={job.title}
              location={job.location}
              department={job.department}
              type={job.type}
              salary={job.salary}
            />
          </div>

          {/* MAIN CONTENT (scroll area feel) */}
          <div className="space-y-10">

            <JobTabs
              overview={
                <JobOverview
                  overview={job.overview}
                  responsibilities={job.responsibilities}
                  requirements={job.requirements}
                />
              }
              application={<JobApplication />}
            />

          </div>

        </div>
      </div>
    </main>
  );
}