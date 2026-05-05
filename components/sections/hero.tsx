"use client";

import { useState } from "react";

export default function HeroSection() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section id="hero" className="relative overflow-hidden bg-transparent">
      <div className="absolute inset-0">
        {!videoFailed && (
          <video
            className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/cirglob-hero-poster.jpg"
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,10,0.25)_0%,rgba(5,6,10,0.62)_45%,rgba(5,6,10,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(77,124,255,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(124,58,237,0.16),transparent_26%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-70px)] w-full max-w-7xl items-center px-6 py-20 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Building the Future from Emerging Markets.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
            Cirglob connects founders solving real problems with visibility,
            opportunity, and the path to future capital.
          </p>
        </div>
      </div>
    </section>
  );
}