import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * ApplyCTA Component
 * A high-fidelity, pixel-perfect reproduction matching the layout, 
 * extreme side typography, and immersive 3D depth of the reference image.
 */
export default function ApplyCTA() {
  return (
    <section className="relative w-full min-h-screen bg-[#010309] text-white flex items-center justify-between overflow-hidden font-sans antialiased selection:bg-blue-600/30">
      
      {/* ========================================================================= */}
      {/* 3D CINEMATIC BACKGROUND SYSTEM (ORB, TUNNEL & PERSPECTIVE FLOOR)          */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1920 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Atmospheric Core Plasma Glows */}
            <radialGradient id="orbCore3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#E2E9FF" stopOpacity="1" />
              <stop offset="55%" stopColor="#3B6BF6" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#1E3A8A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#010309" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="ambientChamberGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0B1530" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#010309" stopOpacity="0" />
            </radialGradient>

            {/* Infinite Vertical Energy Beam */}
            <linearGradient id="verticalEnergyBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
            </linearGradient>

            {/* Linear Perspective 3D Floor Grid Reflection */}
            <linearGradient id="3dFloorReflection" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
              <stop offset="30%" stopColor="#1D4ED8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#010309" stopOpacity="0" />
            </linearGradient>

            {/* High-Dynamic Range (HDR) Bloom Filters */}
            <filter id="bloomSoft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="20" />
            </filter>
            <filter id="bloomIntense" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="65" />
            </filter>
          </defs>

          {/* Deep Void Space Canvas */}
          <rect width="1920" height="1080" fill="#010309" />

          {/* 3D Perspective Wireframe Tunnel (Concentric Ellipses passing into depth) */}
          <g stroke="white" strokeOpacity="0.05" strokeWidth="1">
            {[...Array(32)].map((_, i) => (
              <ellipse 
                key={i} 
                cx="960" 
                cy="510" 
                rx={100 + i * 95} 
                ry={520 + i * 26} 
                fill="none" 
              />
            ))}
          </g>

          {/* Infinite Vertical Pillar Line */}
          <line x1="960" y1="0" x2="960" y2="1080" stroke="url(#verticalEnergyBeam)" strokeWidth="1.5" />
          <line x1="960" y1="200" x2="960" y2="800" stroke="url(#verticalEnergyBeam)" strokeWidth="8" filter="url(#bloomSoft)" opacity="0.4" />

          {/* Layered High-Intensity 3D Celestial Orb */}
          <circle cx="960" cy="510" r="380" fill="url(#ambientChamberGlow)" filter="url(#bloomIntense)" />
          <circle cx="960" cy="510" r="180" fill="#2563EB" fillOpacity="0.25" filter="url(#bloomSoft)" />
          <circle cx="960" cy="510" r="140" fill="url(#orbCore3D)" />
          <circle cx="960" cy="510" r="85" fill="white" filter="url(#bloomSoft)" opacity="0.95" />

          {/* 3D Floor Plane Grid Intersection & Horizon */}
          <line x1="0" y1="730" x2="1920" y2="730" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
          <rect x="0" y="730" width="1920" height="350" fill="url(#3dFloorReflection)" />
          
          {/* Volumetric Specular Ground Light Reflection */}
          <ellipse cx="960" cy="820" rx="140" ry="110" fill="url(#orbCore3D)" opacity="0.2" filter="url(#bloomIntense)" />

          {/* Ultra-Sharp Character Silhouette Standing in Center Space */}
          <g transform="translate(945, 625)" fill="#000000">
            {/* Head & Neck */}
            <circle cx="15" cy="6" r="5" />
            <path d="M12 11 h6 v5 h-6 z" />
            {/* Upper Torso */}
            <path d="M5 15 c3-3 17-3 20 0 l2 22 -24 0 z" />
            {/* Structured Long Trench Coat Flaps */}
            <path d="M7 35 l-5 78 h13 l-1-42 h2 l-1 42 h13 l-5 -78 z" />
            {/* Symmetric Left / Right Arm Slits */}
            <path d="M6 16 c-1 5-2 15-1 25 l3 1 z" />
            <path d="M24 16 c1 5 2 15 1 25 l-3 1 z" />
          </g>
        </svg>

        {/* Cinematic Peripheral Ambient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010309] via-transparent to-[#010309]/90 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#010309] via-transparent to-[#010309] opacity-85" />
      </div>

      {/* ========================================================================= */}
      {/* USER INTERFACE CONTENT LAYER (FLANKED LAYOUT SYSTEM)                      */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col lg:flex-row items-center lg:items-start justify-between px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 py-16 lg:py-0">
        
        {/* LEFT COMPONENT: Statement Headline (Fixed to Extreme Left End) */}
        <div className="w-full lg:max-w-[540px] text-left lg:self-center select-none mb-12 lg:mb-0">
          <h1 className="text-[44px] sm:text-[58px] md:text-[72px] lg:text-[76px] xl:text-[84px] font-bold tracking-tight leading-[1.03] text-white font-sans">
            The future is built <br />
            by those no one <br />
            saw coming.
          </h1>
        </div>

        {/* RIGHT COMPONENT: Action Panel (Fixed to Extreme Right End) */}
        <div className="w-full lg:max-w-[440px] flex flex-col items-start lg:text-left lg:self-center lg:pt-12">
          {/* Secondary Subheading Header */}
          <div className="mb-8 select-none">
            <h2 className="text-[34px] sm:text-[40px] lg:text-[44px] font-medium tracking-tight leading-[1.15] text-white/95">
              Be part of <br />
              the next chapter.
            </h2>
          </div>
          
          {/* Custom White Action Pill Button Container */}
          <div className="w-full space-y-6">
            <button className="group relative flex items-center justify-between bg-white text-black pl-8 pr-2 py-2 rounded-full w-full max-w-[360px] transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_50px_rgba(255,255,255,0.18)] active:scale-[0.98]">
              <span className="text-[21px] font-semibold tracking-tight text-neutral-900 pl-1">
                Apply as Founder
              </span>
              <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </button>
            
            {/* Explanatory Context Details */}
            <p className="text-white/35 text-[14px] font-normal leading-relaxed max-w-[230px] pl-1 tracking-normal select-none">
              Applications open in structured batches after launch.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}