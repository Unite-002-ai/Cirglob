"use client";

export default function FounderDashboard() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">
          Founder Dashboard
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Manage your startup and track your application progress
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Submit Startup */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Submit Startup
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Create a new startup application to enter the accelerator.
          </p>

          <button
            disabled
            className="mt-6 px-4 py-2 rounded-lg bg-white text-black text-sm opacity-50 cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>

        {/* Startup Status */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Application Status
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Track the review status of your submitted startup.
          </p>

          <div className="mt-6 text-sm text-gray-500">
            No applications yet.
          </div>
        </div>

        {/* Pitch Deck Upload */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Pitch Deck
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Upload and manage your startup pitch materials.
          </p>

          <button
            disabled
            className="mt-6 px-4 py-2 rounded-lg bg-white text-black text-sm opacity-50 cursor-not-allowed"
          >
            Upload (coming soon)
          </button>
        </div>

        {/* Feedback Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">
            Feedback
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Receive insights and feedback from reviewers.
          </p>

          <div className="mt-6 text-sm text-gray-500">
            No feedback available.
          </div>
        </div>
      </div>
    </div>
  );
}