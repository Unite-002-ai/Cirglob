"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const mockStartup = {
  name: "NovaMind",
  tagline: "AI operating system for healthcare intelligence",
  batch: "Winter 2026",
  status: "Active",
  industry: "HealthTech",
  location: "Remote-first",
  description:
    "NovaMind is building the foundational AI infrastructure that powers clinical decision-making, patient intelligence systems, and next-generation healthcare automation.",
  mission:
    "To re-architect global healthcare systems using intelligent, adaptive AI infrastructure.",
  whyNow:
    "Healthcare data is fragmented, slow, and reactive. AI-native systems unlock real-time medical intelligence at global scale.",
  website: "https://novamind.ai",
  founders: [
    {
      name: "Dr. Alex Chen",
      role: "CEO & Co-Founder",
      bio: "Former Stanford AI Lab researcher, ex-Google Health.",
    },
    {
      name: "Maya Patel",
      role: "CTO & Co-Founder",
      bio: "Built distributed ML systems at scale for medical imaging.",
    },
  ],
  news: [
    "Raised $18M Seed Round led by top-tier investors",
    "Launched AI diagnostic assistant beta",
    "Partnered with 3 major hospital networks",
  ],
  jobs: [
    {
      id: "1",
      title: "Senior Backend Engineer",
      salary: "$160K - $240K",
      location: "Remote (EU)",
    },
    {
      id: "2",
      title: "ML Engineer",
      salary: "$150K - $230K",
      location: "Remote (US/EU)",
    },
  ],
};

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params?.slug;

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[200px] rounded-full" />
      </div>

      {/* BACK BUTTON */}
      <div className="relative max-w-[1100px] mx-auto px-6 pt-10">
        <Link
          href="/work-at-startups/companies"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to Companies
        </Link>
      </div>

      {/* HEADER */}
      <section className="relative max-w-[1100px] mx-auto px-6 pt-10 pb-14">
        <div className="flex flex-col gap-3">

          <h1 className="text-[44px] md:text-[56px] font-semibold tracking-tight">
            {mockStartup.name}
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl">
            {mockStartup.tagline}
          </p>

          <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-400">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {mockStartup.batch}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {mockStartup.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {mockStartup.industry}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {mockStartup.location}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">
            <a
              href={mockStartup.website}
              target="_blank"
              className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Visit Website
            </a>

            <Link
              href={`/work-at-startups/jobs?company=${slug}`}
              className="px-5 py-2 rounded-full border border-white/15 bg-white/5 text-sm hover:bg-white/10 transition"
            >
              View Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative max-w-[1100px] mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed text-sm">
                {mockStartup.description}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-3">Mission</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {mockStartup.mission}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-3">Why Now</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {mockStartup.whyNow}
              </p>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">

            {/* FOUNDERS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-4">Founders</h2>

              <div className="space-y-4">
                {mockStartup.founders.map((f, i) => (
                  <div key={i} className="border-b border-white/10 pb-3 last:border-none">
                    <p className="font-medium text-white text-sm">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{f.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* NEWS */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-4">Latest Updates</h2>

              <ul className="space-y-3 text-sm text-gray-300">
                {mockStartup.news.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="relative max-w-[1100px] mx-auto px-6 py-14">
        <h2 className="text-xl font-semibold mb-6">Open Roles</h2>

        <div className="grid md:grid-cols-2 gap-5">
          {mockStartup.jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition"
            >
              <h3 className="font-semibold text-white">{job.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{job.location}</p>
              <p className="text-sm text-gray-300 mt-2">{job.salary}</p>

              <Link
                href={`/work-at-startups/jobs/${job.id}`}
                className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300"
              >
                Apply →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}