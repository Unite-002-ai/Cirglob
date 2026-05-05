"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

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

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
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
        <linearGradient
          id="cg-main"
          x1="14"
          y1="12"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4AA8FF" />
          <stop offset="55%" stopColor="#5B6CFF" />
          <stop offset="100%" stopColor="#7D3DFF" />
        </linearGradient>
      </defs>

      <path
        d="M46 20 A20 20 0 1 0 46 44"
        stroke="url(#cg-main)"
        strokeWidth="10"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        fill="none"
        strokeDasharray={`${circumference - gapSize} ${gapSize}`}
        strokeDashoffset={circumference * 0.35}
      />
    </svg>
  );
}

function CirglobBrand() {
  return (
    <Link
      href="/"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("hero");
        if (el) {
          el.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
      className="mr-8 flex shrink-0 items-center gap-3"
      aria-label="Cirglob Home"
    >
      <CirglobLogo />

      <span className="text-[24px] font-semibold tracking-[-0.03em] text-white [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
        Cirglob
      </span>
    </Link>
  );
}

export default function CirglobTopBar() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(16,22,42,0.72),rgba(9,12,24,0.92))] backdrop-blur-2xl">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <CirglobBrand />

        <nav className="hidden items-center gap-1 xl:flex">
          <Dropdown title="About" items={aboutItems} />
          <Dropdown title="Resources" items={resourceItems} />
          <Dropdown title="Companies" items={companyItems} />
          <Dropdown title="Partners" items={partnerItems} />
        </nav>

        <div className="ml-auto hidden items-center gap-2 xl:flex">
  <Link
    href="/apply"
    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
  >
    Apply
  </Link>

  <Link
    href="/account"
    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
    aria-label="Open account system"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-white/60">
      ◌
    </span>
    <span>Account</span>
  </Link>

  <button
    onClick={() => router.push("/auth/signin")}
    className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
  >
    Sign in
  </button>
</div>

<div className="ml-auto flex items-center gap-2 xl:hidden">
  <Link
    href="/apply"
    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white"
  >
    Apply
  </Link>

  <Link
    href="/account"
    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    aria-label="Open account system"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-white/60">
      ◌
    </span>
    <span className="hidden sm:inline">Account</span>
  </Link>

  <details className="relative">
    <summary className="list-none cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 [&::-webkit-details-marker]:hidden">
      Menu
    </summary>

    <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-2 shadow-2xl backdrop-blur-2xl">
      <MobileLink href="/about">About</MobileLink>
      <MobileLink href="/what-happens-at-cirglob">
        What happens at Cirglob
      </MobileLink>
      <MobileLink href="/faq">FAQ</MobileLink>
      <MobileLink href="/interview-guide">Cirglob Interview Guide</MobileLink>
      <MobileLink href="/blog">Cirglob Blog</MobileLink>

      <div className="my-2 h-px bg-white/10" />

      <MobileLink href="/newsletter">Newsletter</MobileLink>
      <MobileLink href="/for-investors">For Investors</MobileLink>
      <MobileLink href="/verify-founder">Verify Founder</MobileLink>
      <MobileLink href="/find-a-cofounder">Find a Co-Founder</MobileLink>
      <MobileLink href="/demo-day">Demo Day</MobileLink>

      <div className="my-2 h-px bg-white/10" />

      <MobileLink href="/startups">Startups</MobileLink>
      <MobileLink href="/jobs">Jobs</MobileLink>
      <MobileLink href="/companies">Companies</MobileLink>
      <MobileLink href="/partners">Partners</MobileLink>

      <button
        onClick={() => router.push("/auth/signin")}
        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
      >
        Sign in
      </button>
    </div>
  </details>
</div>
      </div>
    </header>
  );
} 
