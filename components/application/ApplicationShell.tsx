"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ApplicationSidebar from "@/components/application/ApplicationSidebar";
import ApplicationContent from "@/components/application/ApplicationContent";
import type { SectionKey } from "@/components/application/application-types";

type SidebarItem = {
  id: SectionKey;
  label: string;
};

type Props = {
  sectionIds: readonly SectionKey[];
  sidebarItems: readonly SidebarItem[];
  children: React.ReactNode;
};

export default function ApplicationShell({
  sectionIds,
  sidebarItems,
  children,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>(
    sectionIds[0] ?? "founders",
  );
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    setActiveSection((current) =>
      sectionIds.includes(current) ? current : sectionIds[0],
    );
  }, [sectionIds]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || sectionIds.length === 0) return;

    const updateActiveSection = () => {
      const isNearBottom =
        root.scrollTop + root.clientHeight >= root.scrollHeight - 40;

      if (isNearBottom) {
        setActiveSection((current) =>
          current === sectionIds[sectionIds.length - 1]
            ? current
            : sectionIds[sectionIds.length - 1],
        );
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const markerLine = rootRect.top + 160;

      let nextActive: SectionKey = sectionIds[0];

      for (const sectionId of sectionIds) {
        const element = root.querySelector<HTMLElement>(
          `[data-section="${sectionId}"]`,
        );

        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= markerLine) {
          nextActive = sectionId;
        } else {
          break;
        }
      }

      setActiveSection((current) =>
        current === nextActive ? current : nextActive,
      );
    };

    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) return;

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateActiveSection();
      });
    };

    root.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    updateActiveSection();

    return () => {
      root.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [sectionIds]);

  const scrollToSection = useCallback((section: SectionKey) => {
    const root = scrollRef.current;
    if (!root) return;

    const el = root.querySelector<HTMLElement>(`[data-section="${section}"]`);
    if (!el) return;

    setActiveSection(section);

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const offset = 24;
    const targetTop = root.scrollTop + (elRect.top - rootRect.top) - offset;
    const maxScrollTop = Math.max(0, root.scrollHeight - root.clientHeight);

    root.scrollTo({
      top: Math.min(Math.max(0, targetTop), maxScrollTop),
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#05060A] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[200px]" />
      </div>

      <aside className="relative z-10 hidden w-[290px] shrink-0 overflow-hidden border-r border-white/10 bg-white/5 backdrop-blur-xl md:block">
        <ApplicationSidebar
          activeSection={activeSection}
          onNavigate={scrollToSection}
          items={sidebarItems}
        />
      </aside>

      <main
        ref={scrollRef}
        className="application-scroll-root relative z-10 min-w-0 flex-1 h-[100dvh] min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar px-6 md:px-14 py-10 md:py-16 pb-18 md:pb-14"
      >
        <ApplicationContent>{children}</ApplicationContent>
      </main>
    </div>
  );
}