"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CirglobBrand from "@/components/CirglobBrand";

interface InvestorTopBarProps {
  variant?: "landing" | "application";
}

export default function InvestorTopBar({
  variant = "application",
}: InvestorTopBarProps) {
  const pathname = usePathname();
  const isApply = pathname?.startsWith("/investors/apply");
  const isLanding = variant === "landing";

  return (
    <header
      className={`relative h-16 w-full border-b transition-all duration-300 ${
        isLanding
          ? "border-white/6 bg-[#05060A]/65 backdrop-blur-3xl"
          : "border-white/8 bg-[#05060A]/80 backdrop-blur-2xl"
      }`}
    >
      {/* subtle sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_45%)]" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <CirglobBrand />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
            Investor Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isApply && (
            <Link
              href="/investors/apply"
              className={`
                rounded-full px-4 py-2 text-sm transition-all
                ${
                  isLanding
                    ? "border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10 hover:text-white"
                    : "border border-white/12 bg-white/10 text-white/90 hover:bg-white/15"
                }
              `}
            >
              Request Access
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
