"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { getSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * STEP 1: VERIFY RECOVERY SESSION
   * (IMPORTANT: Supabase password reset links create a temporary session)
   */
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        /**
         * SECURITY RULE:
         * If no session → user is not in password recovery flow
         */
        if (error || !session) {
          router.replace("/auth/signin");
          return;
        }

        setCheckingSession(false);
      } catch (err) {
        console.error(err);
        router.replace("/auth/signin");
      }
    };

    checkRecoverySession();
  }, [router, supabase]);

  /**
   * VALIDATION
   */
  const validate = () => {
    if (!password) return "Password is required.";
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    return null;
  };

  /**
   * STEP 2: UPDATE PASSWORD (SECURE)
   */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      /**
       * SECURITY BEST PRACTICE:
       * Immediately invalidate session after password reset
       */
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace("/auth/signin");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * LOADING STATE
   */
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060A] text-white">
        <p className="text-sm text-gray-400">
          Verifying reset session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#05060A] text-white flex items-center justify-center px-6 relative overflow-hidden">

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
                Set new password
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Choose a strong password for your Cirglob account
              </p>

              {!success ? (
                <form onSubmit={handleReset} className="mt-8 space-y-5">

                  {/* PASSWORD */}
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
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
                    className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update password"}
                  </button>
                </form>
              ) : (
                <div className="mt-8 space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                    Password updated successfully. Redirecting to sign in...
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}