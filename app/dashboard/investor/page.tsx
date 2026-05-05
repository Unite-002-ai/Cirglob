"use client";

import { useState } from "react";

export default function InvestorDashboard() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">
          Investor Dashboard
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Discover and evaluate startups inside the ecosystem
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row gap-4 md:items-center">
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search startups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition"
        />

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition"
        >
          <option value="all">All Stages</option>
          <option value="idea">Idea</option>
          <option value="mvp">MVP</option>
          <option value="growth">Growth</option>
        </select>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto mt-10">
        
        {/* Empty State */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-lg font-medium">
            No startups available
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Approved startups will appear here once they are submitted and reviewed.
          </p>
        </div>

        {/* Future Grid (DO NOT USE YET) */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          // Startup cards will be rendered here from database
        </div>
        */}
      </div>

      {/* Bookmarks Section */}
      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-lg font-medium">
          Bookmarked Startups
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Save startups to review them later
        </p>

        <div className="mt-6 text-sm text-gray-500">
          No bookmarks yet.
        </div>
      </div>
    </div>
  );
}