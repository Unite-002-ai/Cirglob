import InvestorLayout from "@/components/investors/InvestorLayout";

import Hero from "@/components/investors/sections/Hero";
import Benefits from "@/components/investors/sections/Benefits";
import Comparison from "@/components/investors/sections/Comparison";
import Audience from "@/components/investors/sections/Audience";
import Standards from "@/components/investors/sections/Standards";
import FAQ from "@/components/investors/sections/FAQ";
import CTA from "@/components/investors/sections/CTA";

export default function InvestorsPage() {
  return (
    <InvestorLayout showTopBar>
      <main className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto bg-transparent scroll-smooth scrollbar-hide">
        <div className="relative z-10 flex min-h-full flex-col">
          <Hero />
          <Benefits />
          <Comparison />
          <Audience />
          <Standards />
          <FAQ />
          <CTA />
        </div>
      </main>
    </InvestorLayout>
  );
}
