"use client";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">
          Admin Dashboard
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Review applications and manage the platform
        </p>
      </div>

      {/* Main Sections */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Startup Applications */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Startup Applications
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Review and approve startup submissions
          </p>

          <div className="mt-6 text-sm text-gray-500">
            No applications to review.
          </div>
        </div>

        {/* Investor Applications */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Investor Applications
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Review and approve investor access requests
          </p>

          <div className="mt-6 text-sm text-gray-500">
            No applications to review.
          </div>
        </div>

        {/* Approved Startups */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Approved Startups
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Manage startups visible to investors
          </p>

          <div className="mt-6 text-sm text-gray-500">
            No approved startups.
          </div>
        </div>

        {/* Platform Control */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Platform Control
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Manage system-level settings and moderation tools
          </p>

          <div className="mt-6 space-y-3">
            <button
              disabled
              className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm opacity-50 cursor-not-allowed"
            >
              Manage Batches (coming soon)
            </button>

            <button
              disabled
              className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm opacity-50 cursor-not-allowed"
            >
              System Settings (coming soon)
            </button>
          </div>
        </div>
      </div>

      {/* Future Table Area */}
      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-lg font-medium">
          Review Queue
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          Incoming submissions will appear here for moderation
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-gray-500">
          No items in queue.
        </div>
      </div>
    </div>
  );
}