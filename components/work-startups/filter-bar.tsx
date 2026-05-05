"use client";

import { useState } from "react";

type FilterBarProps = {
  onSearch?: (value: string) => void;
  onFilterChange?: (filters: any) => void;
};

export default function FilterBar({
  onSearch,
  onFilterChange,
}: FilterBarProps) {
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    roleType: "",
    department: "",
    experience: "",
    location: "",
    remote: "",
    salary: "",
    visa: "",
    stage: "",
    batch: "",
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const updateFilter = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const selectClass =
    "bg-white/5 border border-white/10 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-white/20 focus:bg-white/10 transition";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 space-y-4">

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search jobs, companies, skills..."
          className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-blue-400/40 focus:bg-white/10 transition"
        />

        <button className="px-5 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition">
          Search
        </button>
      </div>

      {/* FILTER GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* Role Type */}
        <select
          className={selectClass}
          value={filters.roleType}
          onChange={(e) => updateFilter("roleType", e.target.value)}
        >
          <option value="">Role Type</option>
          <option>Full-time</option>
          <option>Contract</option>
          <option>Internship</option>
        </select>

        {/* Department */}
        <select
          className={selectClass}
          value={filters.department}
          onChange={(e) => updateFilter("department", e.target.value)}
        >
          <option value="">Department</option>
          <option>Engineering</option>
          <option>Product</option>
          <option>Design</option>
          <option>AI / ML</option>
          <option>Growth</option>
          <option>Operations</option>
        </select>

        {/* Experience */}
        <select
          className={selectClass}
          value={filters.experience}
          onChange={(e) => updateFilter("experience", e.target.value)}
        >
          <option value="">Experience</option>
          <option>Entry Level</option>
          <option>Mid Level</option>
          <option>Senior</option>
          <option>Staff+</option>
        </select>

        {/* Location */}
        <select
          className={selectClass}
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
        >
          <option value="">Location</option>
          <option>Remote</option>
          <option>US</option>
          <option>EU</option>
          <option>UK</option>
          <option>Asia</option>
        </select>

        {/* Remote */}
        <select
          className={selectClass}
          value={filters.remote}
          onChange={(e) => updateFilter("remote", e.target.value)}
        >
          <option value="">Work Mode</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>Onsite</option>
        </select>

        {/* Salary */}
        <select
          className={selectClass}
          value={filters.salary}
          onChange={(e) => updateFilter("salary", e.target.value)}
        >
          <option value="">Salary Range</option>
          <option>$50K - $100K</option>
          <option>$100K - $150K</option>
          <option>$150K - $250K</option>
          <option>$250K+</option>
        </select>

        {/* Visa */}
        <select
          className={selectClass}
          value={filters.visa}
          onChange={(e) => updateFilter("visa", e.target.value)}
        >
          <option value="">Visa Support</option>
          <option>Required</option>
          <option>Not Required</option>
        </select>

        {/* Startup Stage */}
        <select
          className={selectClass}
          value={filters.stage}
          onChange={(e) => updateFilter("stage", e.target.value)}
        >
          <option value="">Startup Stage</option>
          <option>Pre-seed</option>
          <option>Seed</option>
          <option>Series A</option>
          <option>Series B+</option>
        </select>
      </div>

      {/* ACTIVE FILTER INDICATOR */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">

        <div>
          Filters active:{" "}
          <span className="text-white">
            {Object.values(filters).filter(Boolean).length}
          </span>
        </div>

        <button
          onClick={() =>
            setFilters({
              roleType: "",
              department: "",
              experience: "",
              location: "",
              remote: "",
              salary: "",
              visa: "",
              stage: "",
              batch: "",
            })
          }
          className="text-gray-400 hover:text-white transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}