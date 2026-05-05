"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AccessPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Checking session...");

  useEffect(() => {
    const handleAccess = async () => {
      try {
        setLoading(true);

        /**
         * STEP 1: AUTH USER
         */
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/auth/signin");
          return;
        }

        /**
         * STEP 2: FETCH PROFILE (source of truth)
         */
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, completed")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          router.replace("/auth/signup");
          return;
        }

        /**
         * STEP 3: ROLE ROUTING
         */
        const role = profile.role;

        if (role === "FOUNDER") {
          setMessage("Redirecting to founder dashboard...");
          router.replace("/founder/dashboard");
          return;
        }

        /**
         * STEP 4: FUTURE-PROOF FALLBACK (investor system later)
         */
        setMessage("Access denied. Redirecting...");
        router.replace("/auth/signin");
      } catch (err) {
        console.error("Access route error:", err);
        router.replace("/auth/signin");
      } finally {
        setLoading(false);
      }
    };

    handleAccess();
  }, [router, supabase]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05060A] text-white px-6">
      <div className="text-center space-y-3">
        <div className="text-sm text-gray-400 animate-pulse">
          {loading ? message : "Redirecting..."}
        </div>

        <div className="w-6 h-6 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}