import CirglobTopBar from "@/components/cirglob-top-bar";
import CirglobBottomBar from "@/components/cirglob-bottom-bar";
import HomePageBackground from "@/components/layout/HomePageBackground";

import HeroSection from "@/components/sections/hero";
import MissionSection from "@/components/sections/mission";
import ProblemsSection from "@/components/sections/problems";
import WhyCirglob from "@/components/sections/why-cirglob";
import HowItWorks from "@/components/sections/how-it-works";
import NewsSection from "@/components/home/NewsSection";
import ApplyCTA from "@/components/sections/apply-cta";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type HomeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

function buildName(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null,
) {
  const fullName = [firstName, lastName]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();

  return fullName || fallback || "User";
}

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  let initialUser: HomeUser | null = null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    initialUser = {
      id: user.id,
      name: buildName(
        profile?.first_name,
        profile?.last_name,
        (user.user_metadata?.full_name as string | undefined) ??
          user.email ??
          "User",
      ),
      email: profile?.email ?? user.email ?? "",
      image:
        profile?.avatar_url ??
        (user.user_metadata?.avatar_url as string | undefined) ??
        null,
    };
  }

  return (
    <HomePageBackground>
      <main className="relative min-h-screen overflow-x-hidden text-white">
        <CirglobTopBar initialUser={initialUser} />

        <div className="relative z-10 flex flex-col pt-[70px]">
          <HeroSection />
          <MissionSection />
          <ProblemsSection />
          <WhyCirglob />
          <HowItWorks />
          <NewsSection />
          <ApplyCTA />
          <CirglobBottomBar />
        </div>
      </main>
    </HomePageBackground>
  );
}
