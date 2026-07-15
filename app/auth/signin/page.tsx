"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import CirglobBrand from "@/components/CirglobBrand";
import { getSupabaseClient } from "@/lib/supabase/client";

const DEFAULT_REDIRECT = "/apply/dashboard";

export default function SigninPage() {
  const searchParams = useSearchParams();

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ============================================
   * VALIDATION
   * ============================================
   * Minimal + deterministic.
   * Business validation should later move into:
   * /lib/validators.ts
   */

  const validate = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return "Email and password are required.";
    }

    const emailRegex =
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailRegex.test(normalizedEmail)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  /**
   * ============================================
   * SECURE REDIRECT HANDLING
   * ============================================
   * Prevents:
   * - open redirects
   * - malformed redirect injection
   * - external navigation abuse
   */

  const getRedirectUrl = () => {
    const next = searchParams.get("next");

    if (!next) {
      return DEFAULT_REDIRECT;
    }

    if (
      next.startsWith("/") &&
      !next.startsWith("//")
    ) {
      return next;
    }

    return DEFAULT_REDIRECT;
  };

  /**
   * ============================================
   * SIGN IN FLOW
   * ============================================
   * Production-safe flow:
   * - deterministic auth handling
   * - normalized email input
   * - secure redirect handling
   * - stable loading states
   * - no fragmented auth logic
   */

  const handleSignin = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (loading) return;

    setError(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data?.session || !data?.user) {
        setError(
          "Unable to establish a secure session. Please try again.",
        );

        return;
      }

      /**
       * ============================================
       * IMPORTANT ARCHITECTURE NOTE
       * ============================================
       * Profiles are automatically created by:
       *
       * public.handle_new_user()
       *
       * trigger on auth.users
       *
       * NEVER create profiles manually here.
       */

      const redirectUrl = getRedirectUrl();

      if (typeof window !== "undefined") {
        window.location.assign(redirectUrl);
      }

      return;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected authentication error.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060A] px-6 text-white">
      {/* ============================================
          BRAND
      ============================================ */}

      <div className="absolute left-6 top-6 z-20">
        <CirglobBrand />
      </div>

      {/* ============================================
          BACKGROUND GLOW
      ============================================ */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[800px] w-[800px] rounded-full bg-blue-500/10 blur-[200px]" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      {/* ============================================
          CARD
      ============================================ */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/10 blur-2xl" />

          <div className="relative z-10">
            {/* ============================================
                HEADER
            ============================================ */}

            <h1 className="text-2xl font-semibold">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Access your Cirglob dashboard
            </p>

            {/* ============================================
                FORM
            ============================================ */}

            <form
              onSubmit={handleSignin}
              className="mt-8 space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={loading}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Password
                </label>

                <input
                  type="password"
                  autoComplete="current-password"
                  disabled={loading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* ERROR */}

              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white py-3 font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* ============================================
                FOOTER LINKS
            ============================================ */}

            <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
              <p>
                No account?{" "}
                <Link
                  href={`/auth/signup?next=${encodeURIComponent(
                    getRedirectUrl(),
                  )}`}
                  className="text-white transition hover:underline"
                >
                  Create one
                </Link>
              </p>

              <p>
                <Link
                  href="/auth/forgot-password"
                  className="text-white/70 transition hover:text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}