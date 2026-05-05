"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CirglobTopBar() {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY && currentY > 80) {
        setHidden(true); // scrolling down → compact bar
      } else {
        setHidden(false); // scrolling up → full bar
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        border-b border-white/10
        backdrop-blur-2xl
        bg-black/40
      `}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT (logo system) */}
        <Link href="/" className="flex items-center gap-3">

          {/* Logo */}
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10" />

          {/* Brand text collapses on scroll */}
          {!hidden && (
            <div className="leading-tight">
              <p className="text-xs text-white/40">Cirglob</p>
              <p className="text-sm font-medium tracking-tight">
                Global Venture Intelligence
              </p>
            </div>
          )}

        </Link>

        {/* RIGHT optional space (future nav) */}
        <div className="text-xs text-white/40">
          {hidden ? "" : "AI-native platform for founders"}
        </div>

      </div>
    </div>
  );
}