"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase/client";

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email) return "Email is required.";
    if (!email.includes("@")) return "Please enter a valid email.";
    return null;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const redirectTo =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
          : "http://localhost:3000/auth/reset-password";

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error(error);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05060A] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* TOP LEFT BRAND (ADDED) */}
      <div className="absolute top-6 left-6 z-20">
        <CirglobBrand />
      </div>

      {/* Background glow (UNCHANGED DESIGN) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

            <div className="absolute -inset-1 bg-blue-500/10 blur-2xl rounded-2xl" />

            <div className="relative z-10">

              <h2 className="text-2xl font-semibold text-white">
                Reset your password
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Enter your email and we’ll send you a secure reset link
              </p>

              {!success ? (
                <form onSubmit={handleReset} className="mt-8 space-y-5">

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Sending link..." : "Send reset link"}
                  </button>
                </form>
              ) : (
                <div className="mt-8 space-y-4">

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                    If an account exists for this email, a password reset link has been sent.
                  </div>

                  <button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
                  >
                    Back to sign in
                  </button>
                </div>
              )}

              {!success && (
                <p className="mt-6 text-sm text-gray-500 text-center">
                  Remember your password?{" "}
                  <span
                    className="text-white cursor-pointer hover:underline"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Sign in
                  </span>
                </p>
              )}

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}