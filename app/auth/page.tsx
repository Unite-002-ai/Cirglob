"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * ===========================
 * CIRGLOB AUTH ENTRY PAGE
 * Production-grade router gate
 * ===========================
 */

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
      className="absolute left-6 top-6 z-20 flex items-center gap-3"
      aria-label="Cirglob Home"
    >
      <CirglobLogo />
      <span className="text-[24px] font-semibold tracking-[-0.03em] text-white">
        Cirglob
      </span>
    </Link>
  );
}

export default function AuthEntryPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Session check failed:", error.message);
          router.replace("/auth/signin");
          return;
        }

        // -----------------------------
        // CASE 1: LOGGED IN → GO TO FOUNDER DASHBOARD
        // -----------------------------
        if (session?.user) {
          router.replace("/founder/dashboard");
          return;
        }

        // -----------------------------
        // CASE 2: NO SESSION → SIGNIN
        // -----------------------------
        router.replace("/auth/signin");
      } catch (err) {
        console.error("Auth entry error:", err);
        router.replace("/auth/signin");
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060A] text-white">
      <CirglobBrand />

      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,124,255,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,200,255,0.08),transparent_60%)]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.04]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-10 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 text-center"
            >
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Redirecting...
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Checking your Cirglob identity session
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm text-gray-400">
                Securing founder access layer...
              </p>
            </motion.div>
          </motion.div>

          <p className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Cirglob. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}