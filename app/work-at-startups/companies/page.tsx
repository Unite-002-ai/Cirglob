"use client";

import { useMemo, useState } from "react";
import CompanyCard from "@/components/work-at-startups/company-card";
import FilterBar from "@/components/work-at-startups/filter-bar";
import { COMPANIES } from "@/lib/work-at-startups-data";

export default function CompaniesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMPANIES;

    return COMPANIES.filter((c) =>
      [c.name, c.mission, c.description, c.sector, c.stage, c.batch]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#7C8CFF]/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[700px] h-[700px] bg-[#D4AF37]/10 blur-[220px] rounded-full" />
      </div>

      <div className="relative max-w-[1180px] mx-auto px-6 pt-20 pb-10">
        <h1 className="text-[42px] md:text-[58px] font-semibold tracking-tight">
          Startup Companies
        </h1>

        <p className="mt-4 text-white/55 max-w-2xl leading-relaxed">
          Discover portfolio startups building the next generation of AI, infrastructure, fintech, and healthcare products.
        </p>

        <div className="mt-8">
          <FilterBar onSearch={setQuery} />
        </div>
      </div>

      <div className="relative max-w-[1180px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((company) => (
            <CompanyCard key={company.id} {...company} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-white/45 mt-20">
            No companies found matching your search.
          </div>
        )}
      </div>
    </main>
  );
}
