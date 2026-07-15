import InvestorLayout from '@/components/investors/InvestorLayout';
import Link from 'next/link';

export default function InvestorSubmittedPage() {
  return (
    <InvestorLayout>
      <div className="h-screen w-full bg-[#05060A] text-white relative overflow-hidden flex items-center justify-center">
        {/* Ambient background system (consistent with platform) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />
          <div className="absolute bottom-[-25%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl w-full px-8 text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wide text-white/70 mb-8">
            Application received
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Application received
          </h1>

          {/* Divider */}
          <div className="w-16 h-[1px] bg-white/10 mx-auto mb-6" />

          {/* Body text */}
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            Thank you for your interest in the Cirglob Investor Network.
            <br />
            <br />
            Applications are reviewed carefully. Qualified applicants may be
            contacted for next steps.
          </p>

          {/* Meta information (subtle institutional detail) */}
          <div className="space-y-2 text-xs text-white/40 mb-12">
            <p>Estimated review time: 3–10 days</p>
            <p>All applications are evaluated individually</p>
          </div>

          {/* Action */}
          <Link
            href="/investors"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            Return to overview
          </Link>

          {/* Secondary subtle note */}
          <p className="text-[11px] text-white/30 mt-6">
            Cirglob Investor Network • Private access layer
          </p>
        </div>
      </div>
    </InvestorLayout>
  );
}
