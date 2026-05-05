"use client";

import { useEffect } from "react";
import CirglobBottomBar from "@/components/cirglob-bottom-bar";
import LegalTopBar from "@/components/legal/legal-top-bar";

export default function LegalPage() {
  const lastUpdated = "April 2026";

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <main className="min-h-screen bg-[#05060A] text-white">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[180px] rounded-full" />
      </div>

      {/* ✅ FIXED TOP BAR */}
      <LegalTopBar />

      {/* CONTENT (IMPORTANT: padding-top for fixed header) */}
      <div className="relative max-w-[900px] mx-auto px-6 pt-[110px] pb-[120px]">

        {/* HEADER */}
        <div className="mb-14">
          <h1 className="text-[48px] md:text-[58px] font-semibold tracking-tight">
            Legal
          </h1>

          <p className="mt-4 text-gray-400 text-[16px] leading-[1.7] max-w-xl">
            Cirglob’s Privacy Policy, Terms of Use, and Trademarks governing participation in the ecosystem.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* PRIVACY */}
        <section id="privacy-policy" className="scroll-mt-32 mb-24">
          <h2 className="text-xl font-semibold mb-6">Privacy Policy</h2>

          <div className="space-y-5 text-gray-300 leading-[1.8] text-[15px]">
            <p>Cirglob collects founder, investor, and application data including pitch decks and submissions.</p>
            <p>Data is used for evaluation, platform operation, and ecosystem matching.</p>
            <p>We may use cookies and analytics to improve performance.</p>
            <p>Application data may be reviewed internally by mentors and investors.</p>
          </div>
        </section>

        {/* TERMS */}
        <section id="terms-of-use" className="scroll-mt-32 mb-24">
          <h2 className="text-xl font-semibold mb-6">Terms of Use</h2>

          <div className="space-y-5 text-gray-300 leading-[1.8] text-[15px]">
            <p>Users must provide accurate information when applying to Cirglob.</p>
            <p>Applications may be accepted or rejected at Cirglob’s discretion.</p>
            <p>No scraping, impersonation, or misuse of platform is allowed.</p>
            <p>Cirglob may use submissions internally for evaluation purposes.</p>
          </div>
        </section>

        {/* TRADEMARKS */}
        <section id="trademarks" className="scroll-mt-32 mb-16">
          <h2 className="text-xl font-semibold mb-6">Trademarks</h2>

          <div className="space-y-5 text-gray-300 leading-[1.8] text-[15px]">
            <p>“Cirglob” name, logo, and program branding are protected assets.</p>
            <p>Unauthorized use is strictly prohibited without permission.</p>
            <p>Third-party trademarks belong to their respective owners.</p>
          </div>
        </section>

      </div>

      {/* Bottom bar stays */}
      <CirglobBottomBar />
    </main>
  );
}