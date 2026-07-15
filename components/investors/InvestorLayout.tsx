"use client";

import { ReactNode } from "react";
import InvestorTopBar from "@/components/investors/InvestorTopBar";

interface InvestorLayoutProps {
  children: ReactNode;
  showTopBar?: boolean;
}

export default function InvestorLayout({
  children,
  showTopBar = true,
}: InvestorLayoutProps) {
  return (
    // Base changed to a deeper, near-black tint
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#020305] text-white">
      
      {/* Background System: Ultra-Dark Calm Capital Energy */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        
        {/* Blue Glow (Top-Left) - Reduced to 5% opacity, higher blur */}
        <div 
          className="absolute top-[-25%] left-[-15%] w-[800px] h-[800px] bg-blue-600/5 blur-[300px] rounded-full" 
          aria-hidden="true"
        />
        
        {/* Purple Glow (Bottom-Right) - Reduced to 5% opacity, higher blur */}
        <div 
          className="absolute bottom-[-25%] right-[-15%] w-[800px] h-[800px] bg-purple-900/5 blur-[300px] rounded-full" 
          aria-hidden="true"
        />
      </div>

      {/* Navigation */}
      {showTopBar && (
        <div className="relative z-20 shrink-0">
          <InvestorTopBar variant="landing" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 min-h-0 flex-1 w-full overflow-hidden">
        {children}
      </main>

      {/* Global Overlays Portal */}
      <div
        id="investor-overlays"
        className="pointer-events-none absolute inset-0 z-30"
      />
    </div>
  );
}
