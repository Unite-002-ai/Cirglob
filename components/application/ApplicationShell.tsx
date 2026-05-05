// ===============================================
// FILE: components/application/ApplicationShell.tsx
// ===============================================
"use client";

import React, { useEffect, useRef, useState } from "react";
import ApplicationSidebar from "@/components/application/ApplicationSidebar";
import ApplicationContent from "@/components/application/ApplicationContent";

type SectionKey =
  | "founders"
  | "video"
  | "company"
  | "progress"
  | "idea"
  | "equity"
  | "curious"
  | "batch";

const SECTION_IDS: SectionKey[] = [
  "founders",
  "video",
  "company",
  "progress",
  "idea",
  "equity",
  "curious",
  "batch",
];

export default function ApplicationShell() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("founders");

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const elements = SECTION_IDS
      .map((id) => root.querySelector<HTMLElement>(`[data-section="${id}"]`))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const id = visible.target.getAttribute("data-section") as SectionKey | null;
          if (id) setActiveSection(id);
        }
      },
      {
        root,
        threshold: [0.2, 0.35, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (section: SectionKey) => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-section="${section}"]`
    );

    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setActiveSection(section);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#05060A] text-white flex">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
      </div>

      {/* LEFT SIDEBAR */}
      <aside className="hidden md:block relative z-10 w-[290px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <ApplicationSidebar
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
      </aside>

      {/* RIGHT CONTENT */}
      <main
        ref={scrollRef}
        className="relative z-10 flex-1 h-screen overflow-y-auto no-scrollbar px-6 md:px-14 py-10 md:py-16 pb-32 md:pb-48"
      >
        <ApplicationContent />
      </main>

      <style jsx global>{`
        html,
        body {
          background: #05060a;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}