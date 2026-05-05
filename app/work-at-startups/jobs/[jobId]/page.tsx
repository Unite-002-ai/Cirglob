"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Job = {
  id: string;
  company: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  mission: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
};

const JOBS: Job[] = [
  {
    id: "ml-engineer",
    company: "NovaMind",
    slug: "novamind",
    title: "Machine Learning Engineer",
    location: "Remote (US/EU)",
    type: "Full-time",
    salary: "$150K – $220K",
    mission: "AI operating system for healthcare",
    overview:
      "You will build and scale machine learning systems that power healthcare intelligence at a global level.",
    responsibilities: [
      "Design and deploy ML models at scale",
      "Work with large healthcare datasets",
      "Collaborate with product and infra teams",
      "Improve model performance and reliability",
    ],
    requirements: [
      "Strong ML/AI background",
      "Experience with Python and ML frameworks",
      "Understanding of scalable systems",
      "Startup mindset",
    ],
    niceToHave: [
      "Healthcare data experience",
      "Experience with LLMs",
      "Distributed systems exposure",
    ],
    benefits: [
      "Competitive salary + equity",
      "Remote-first flexibility",
      "Direct access to founders",
      "Work on real-world AI impact",
    ],
  },
];

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.jobId as string;

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

      {/* 🌌 Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative max-w-[1000px] mx-auto px-6 py-16">

        {/* BACK */}
        <Link
          href="/work-at-startups/jobs"
          className="text-sm text-white/50 hover:text-white transition"
        >
          ← Back to jobs
        </Link>

        {/* HEADER */}
        <div className="mt-6">
          <h1 className="text-[40px] md:text-[52px] font-semibold tracking-tight leading-tight">
            {job.title}
          </h1>

          <div className="mt-4 text-white/60">
            <Link
              href={`/work-at-startups/companies/${job.slug}`}
              className="hover:text-white"
            >
              {job.company}
            </Link>
            <span> · {job.location} · {job.type}</span>
          </div>

          <div className="mt-2 text-white/80 text-sm">
            {job.salary}
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              href={`/work-at-startups/apply/${job.id}`}
              className="px-5 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Apply Now
            </Link>

            <Link
              href={`/work-at-startups/companies/${job.slug}`}
              className="px-5 py-3 rounded-xl border border-white/15 text-sm hover:bg-white/5 transition"
            >
              View Company
            </Link>
          </div>
        </div>

        {/* OVERVIEW */}
        <section className="mt-14">
          <h2 className="text-lg font-medium mb-4">Role Mission</h2>
          <p className="text-white/60 leading-relaxed">
            {job.overview}
          </p>
        </section>

        {/* RESPONSIBILITIES */}
        <section className="mt-10">
          <h2 className="text-lg font-medium mb-4">Responsibilities</h2>
          <ul className="space-y-3 text-white/60">
            {job.responsibilities.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* REQUIREMENTS */}
        <section className="mt-10">
          <h2 className="text-lg font-medium mb-4">Requirements</h2>
          <ul className="space-y-3 text-white/60">
            {job.requirements.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-purple-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* NICE TO HAVE */}
        <section className="mt-10">
          <h2 className="text-lg font-medium mb-4">Nice to Have</h2>
          <ul className="space-y-3 text-white/60">
            {job.niceToHave.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* BENEFITS */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium mb-3">Benefits</h2>
          <ul className="space-y-2 text-white/60 text-sm">
            {job.benefits.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </section>

        {/* FINAL CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-xl font-medium">
            Ready to build with {job.company}?
          </h2>

          <p className="text-white/60 mt-2 text-sm">
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