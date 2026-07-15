"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import CirglobBrand from "@/components/CirglobBrand";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  AUTH_ROUTES,
  DEFAULT_AUTH_REDIRECT,
} from "@/lib/constants";

type SignupFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const searchParams = useSearchParams();

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [form, setForm] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next =
    searchParams.get("next")?.trim() || DEFAULT_AUTH_REDIRECT;

  const updateField = (
    field: keyof SignupFormState,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!firstName || !lastName || !email || !password) {
      return "All fields are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    return null;
  };

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (loading) return;

    setError(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const email = form.email.trim().toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${AUTH_ROUTES.CALLBACK}?next=${encodeURIComponent(next)}`
          : undefined;

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
          emailRedirectTo: redirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            avatar_url: null,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      /**
       * Profile creation is handled entirely by the DB trigger:
       * auth.users -> public.handle_new_user() -> public.profiles
       */

      const hasSession = Boolean(data.session);
      const hasUser = Boolean(data.user);

      if (hasSession) {
        if (typeof window !== "undefined") {
          window.location.assign(next);
        }
        return;
      }

      if (hasUser && !hasSession) {
        if (typeof window !== "undefined") {
          window.location.assign(
            `${AUTH_ROUTES.ACCESS}?next=${encodeURIComponent(next)}`,
          );
        }
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(AUTH_ROUTES.SIGNIN);
      }
    } catch (err) {
      console.error("Signup error:", err);

      setError("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060A] px-6 text-white">
      <div className="absolute left-6 top-6 z-20">
        <CirglobBrand />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[800px] w-[800px] rounded-full bg-blue-500/10 blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/10 blur-2xl" />

          <div className="relative z-10">
            <h1 className="text-2xl font-semibold">Create account</h1>

            <p className="mt-2 text-sm text-gray-400">
              Build your Cirglob identity layer
            </p>

            <form onSubmit={handleSignup} className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm text-gray-400"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) =>
                      updateField("firstName", e.target.value)
                    }
                    placeholder="John"
                    disabled={loading}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 disabled:opacity-60"
                  />
                </div>

                <div className="w-1/2">
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm text-gray-400"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) =>
                      updateField("lastName", e.target.value)
                    }
                    placeholder="Doe"
                    disabled={loading}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-gray-400"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-gray-400"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/20 disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Minimum 8 characters.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white py-3 font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href={`${AUTH_ROUTES.SIGNIN}?next=${encodeURIComponent(next)}`}
                className="text-white transition hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}