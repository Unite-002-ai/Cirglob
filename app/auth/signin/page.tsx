"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
      className="absolute left-6 top-6 z-20 mr-8 flex shrink-0 items-center gap-3"
      aria-label="Cirglob Home"
    >
      <CirglobLogo />

      <span className="text-[24px] font-semibold tracking-[-0.03em] text-white [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
        Cirglob
      </span>
    </Link>
  );
}

export default function SigninPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email || !password) return "Email and password are required.";
    if (!email.includes("@")) return "Please enter a valid email.";
    return null;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // =========================
      // REAL SUPABASE AUTH
      // =========================
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError("Authentication failed. Please try again.");
        return;
      }

      // =========================
      // SUCCESS → LET MIDDLEWARE HANDLE OR REDIRECT
      // =========================
      router.push("/founder/dashboard");
    } catch (err: any) {
      setError(err?.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060A] px-6 text-white">
      <CirglobBrand />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-purple-500/10 blur-[180px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-lg grid-cols-1 items-center gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="absolute -inset-1 rounded-2xl bg-blue-500/10 blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white">Sign in</h2>

              <p className="mt-2 text-sm text-gray-400">
                Access your Cirglob dashboard
              </p>

              <form onSubmit={handleSignin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-white py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
                <p>
                  Don’t have an account?{" "}
                  <span
                    className="cursor-pointer text-white hover:underline"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Create one
                  </span>
                </p>

                <p>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      router.push("/auth/forgot-password")
                    }
                  >
                    Forgot password?
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}