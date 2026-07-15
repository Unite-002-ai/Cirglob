"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import IdentityCluster from "@/components/account/identity/IdentityCluster";
import AccountDropdown from "@/components/account/ui/AccountDropdown";
import { useAccountIdentity } from "@/components/account/hooks/useAccountIdentity";
import {
  buildAuthNextFromLocation,
  buildSigninHref,
} from "@/lib/navigation/auth-urls";

const aboutItems = [
  { label: "What happens at Cirglob", href: "/what-happens-at-cirglob" },
  { label: "FAQ", href: "/faq" },
  { label: "Cirglob Interview Guide", href: "/interview-guide" },
  { label: "Cirglob Blog", href: "/blog" },
];

const resourceItems = [
  { label: "Newsletter", href: "/newsletter" },
  { label: "For Investors", href: "/for-investors" },
  { label: "Verify Founder", href: "/verify-founder" },
  { label: "Find a Co-Founder", href: "/find-a-cofounder" },
  { label: "Demo Day", href: "/demo-day" },
];

const companyItems = [
  { label: "Startups", href: "/startups" },
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
];

const partnerItems = [
  { label: "Partners", href: "/partners" },
  { label: "Institutional Partners", href: "/partners#institutional" },
  { label: "Ecosystem Partners", href: "/partners#ecosystem" },
];
 
function Dropdown({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="relative group">
      <button className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white">
        {title}
        <span className="text-[10px] opacity-60">▾</span>
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-3 w-64 translate-y-1 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-2 opacity-0 shadow-2xl backdrop-blur-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CirglobLogo() {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 5;

  return (
    <svg
      width="30"
      height="36"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cg-main" x1="14" y1="12" x2="50" y2="52">
          <stop offset="0%" stopColor="#4AA8FF" />
          <stop offset="55%" stopColor="#5B6CFF" />
          <stop offset="100%" stopColor="#7D3DFF" />
        </linearGradient>
      </defs>

      <path
        d="M46 20 A20 20 0 1 0 46 44"
        stroke="url(#cg-main)"
        strokeWidth="10"
        fill="none"
        strokeDasharray={`${circumference - gapSize} ${gapSize}`}
        strokeDashoffset={circumference * 0.35}
      />
    </svg>
  );
}

function CirglobBrand() {
  return (
    <Link href="/" className="mr-8 flex shrink-0 items-center gap-3">
      <CirglobLogo />
      <span className="text-[24px] font-semibold tracking-[-0.03em] text-white">
        Cirglob
      </span>
    </Link>
  );
}

type CirglobTopBarProps = {
  initialUser?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

export default function CirglobTopBar({
  initialUser = null,
}: CirglobTopBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const signInHref = useMemo(() => {
    const next = buildAuthNextFromLocation(pathname, searchParams.toString());
    return buildSigninHref(next);
  }, [pathname, searchParams]);

  const { user, dropdownOpen, toggleDropdown, closeDropdown } =
    useAccountIdentity(initialUser);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = !!user;

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] w-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(16,22,42,0.72),rgba(9,12,24,0.92))] backdrop-blur-2xl">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <CirglobBrand />

        <nav className="hidden items-center gap-1 xl:flex">
          <Dropdown title="About" items={aboutItems} />
          <Dropdown title="Resources" items={resourceItems} />
          <Dropdown title="Companies" items={companyItems} />
          <Dropdown title="Partners" items={partnerItems} />
        </nav>

        <div
          ref={accountMenuRef}
          className="ml-auto flex items-center gap-2"
        >
          <Link
            href="/apply"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Apply
          </Link>

          <div className="hidden items-center gap-2 xl:flex">
            {isAuthenticated ? (
              <IdentityCluster
                name={user?.name || "Account"}
                image={user?.image ?? null}
                open={dropdownOpen}
                onToggle={toggleDropdown}
              />
            ) : (
              <Link
                href={signInHref}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            {isAuthenticated ? (
              <IdentityCluster
                name={user?.name || "Account"}
                image={user?.image ?? null}
                open={dropdownOpen}
                onToggle={toggleDropdown}
              />
            ) : (
              <Link
                href={signInHref}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>

          {isAuthenticated ? (
            <AccountDropdown
              open={dropdownOpen}
              onClose={closeDropdown}
              anchorRef={accountMenuRef}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
} 