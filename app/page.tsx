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

export default function Home() {
  return (
    <HomePageBackground>
      <main className="relative min-h-screen overflow-x-hidden text-white">
        <CirglobTopBar />

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