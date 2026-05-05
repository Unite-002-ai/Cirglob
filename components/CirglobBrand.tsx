"use client";

import Link from "next/link";

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

export default function CirglobBrand() {
  return (
    <Link
      href="/"
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("hero");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
      className="mr-8 flex shrink-0 items-center gap-3"
      aria-label="Cirglob Home"
    >
      <CirglobLogo />

      <span className="text-[24px] font-semibold tracking-[-0.03em] text-white">
        Cirglob
      </span>
    </Link>
  );
}