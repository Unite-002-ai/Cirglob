"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Company = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  batch: string;
  stage: string;
  sector: string;
  location: string;
  jobs: number;
};

const COMPANIES: Company[] = [
  {
    id: "1",
    slug: "novamind",
    name: "NovaMind",
    tagline: "AI operating system for healthcare intelligence",
    batch: "W26",
    stage: "Seed",
    sector: "HealthTech",
    location: "Remote-first",
    jobs: 6,
  },
  {
    id: "2",
    slug: "quantforge",
    name: "QuantForge",
    tagline: "Infrastructure layer for autonomous financial systems",
    batch: "S25",
    stage: "Series A",
    sector: "FinTech",
    location: "US / EU",
    jobs: 4,
  },
  {
    id: "3",
    slug: "orbitlabs",
    name: "OrbitLabs",
    tagline: "Next-generation AI agents for enterprise workflows",
    batch: "W26",
    stage: "Seed",
    sector: "AI",
    location: "Global Remote",
    jobs: 8,
  },
];

export default function CompaniesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return COMPANIES;
    return COMPANIES.filter((c) =>
      (c.name + c.tagline + c.sector)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[200px] rounded-full" />
      </div>

      {/* HEADER */}
      <div className="relative max-w-[1100px] mx-auto px-6 pt-20 pb-10">

        <h1 className="text-[44px] md:text-[56px] font-semibold tracking-tight">
          Startup Companies
        </h1>

        <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
          Discover Cirglob portfolio startups building the next generation of AI,
          infrastructure, fintech, and global systems.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, sectors, or missions..."
            className="w-full md:w-[520px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                       text-white placeholder:text-gray-500 backdrop-blur-xl
                       focus:outline-none focus:border-blue-500/40 transition"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="relative max-w-[1100px] mx-auto px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/work-at-startups/companies/${c.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] 
                         backdrop-blur-xl p-6 hover:border-blue-500/30 transition
                         hover:shadow-[0_0_40px_rgba(108,140,255,0.12)]"
            >

              {/* TOP ROW */}
              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-xl font-semibold group-hover:text-blue-300 transition">
                    {c.name}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {c.tagline}
                  </p>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border border-white/10 text-gray-400">
                  {c.batch}
                </span>
              </div>

              {/* META */}
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-400">

                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  {c.stage}
                </span>

                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  {c.sector}
                </span>

                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  {c.location}
                </span>

              </div>

              {/* FOOTER */}
              <div className="mt-6 flex items-center justify-between">

                <p className="text-sm text-gray-500">
                  {c.jobs} open roles
                </p>

                <span className="text-sm text-blue-400 group-hover:translate-x-1 transition">
                  View Company →
                </span>

              </div>

            </Link>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No companies found matching your search.
          </div>
        )}

      </div>
    </main>
  );
}