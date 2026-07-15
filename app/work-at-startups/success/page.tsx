import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#7C8CFF]/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] bg-[#D4AF37]/10 blur-[200px] rounded-full" />
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-28 flex flex-col items-center text-center">
        <div className="mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 backdrop-blur-xl">
          Application Submitted Successfully
        </div>

        <h1 className="text-[44px] md:text-[56px] font-semibold tracking-tight leading-[1.1]">
          You’re now in the
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C8CFF] to-[#D4AF37]">
            {" "}Cirglob Talent Network
          </span>
        </h1>

        <p className="mt-6 text-white/45 text-[16px] leading-[1.7] max-w-xl">
          Your application has been delivered to the startup team. If there’s a strong match, they’ll reach out directly for next steps.
        </p>

        <div className="mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-left shadow-xl">
          <h2 className="text-sm text-white/80 font-medium mb-4">
            What happens next
          </h2>

          <div className="space-y-3 text-sm text-white/55">
            <p>• Startup reviews your application</p>
            <p>• AI-assisted matching evaluates fit</p>
            <p>• Shortlisted candidates get contacted</p>
            <p>• Interviews are scheduled directly</p>
          </div>

          <div className="mt-5 text-xs text-white/35">
            Typical response time: 3–10 days
          </div>
        </div>

        <div className="mt-6 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 text-left">
          <h3 className="text-sm font-medium text-white mb-2">
            Your profile is now active in:
          </h3>

          <p className="text-sm text-white/45 leading-[1.6]">
            • Startup hiring pools
            <br />
            • Cirglob talent graph
            <br />
            • AI matching system (beta)
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/work-at-startups/jobs"
            className="px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:opacity-90 transition"
          >
            Browse More Jobs
          </Link>

          <Link
            href="/work-at-startups/companies"
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm hover:bg-white/10 transition"
          >
            Explore Startups
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/35 max-w-md">
          Cirglob increases your visibility across high-growth startups, venture-backed companies, and AI-native teams worldwide.
        </p>
      </div>
    </main>
  );
}
