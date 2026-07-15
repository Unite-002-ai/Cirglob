'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type {
  FounderProfile,
  FounderProfileDraftStorage,
  FounderProfileSectionKey,
} from './founder-profile-types';

import {
  PROFILE_DRAFT_STORAGE_KEY,
  defaultFounderProfile,
  coerceFounderProfile,
} from './founder-profile-types';

import FounderProfileSidebar from './FounderProfileSidebar';
import FounderProfileContent from './FounderProfileContent';

type LoadedDraft = {
  profile: FounderProfile;
  lastSavedAt?: string;
};

function loadDraftFromStorage(): LoadedDraft {
  if (typeof window === 'undefined') {
    return {
      profile: defaultFounderProfile,
      lastSavedAt: undefined,
    };
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_DRAFT_STORAGE_KEY);

    if (!raw) {
      return {
        profile: defaultFounderProfile,
        lastSavedAt: undefined,
      };
    }

    const parsed = JSON.parse(raw) as Partial<FounderProfileDraftStorage> & {
      profile?: unknown;
    };

    if (parsed && parsed.profile) {
      return {
        profile: coerceFounderProfile(parsed.profile),
        lastSavedAt:
          typeof parsed.lastSavedAt === 'string' ? parsed.lastSavedAt : undefined,
      };
    }

    return {
      profile: coerceFounderProfile(parsed),
      lastSavedAt: undefined,
    };
  } catch {
    return {
      profile: defaultFounderProfile,
      lastSavedAt: undefined,
    };
  }
}

function persistDraft(profile: FounderProfile): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const savedAt = new Date().toISOString();

  const payload: FounderProfileDraftStorage = {
    version: 1,
    profile,
    lastSavedAt: savedAt,
  };

  window.localStorage.setItem(PROFILE_DRAFT_STORAGE_KEY, JSON.stringify(payload));

  return savedAt;
}

interface FounderProfileShellProps {
  className?: string;
}

export default function FounderProfileShell({
  className = '',
}: FounderProfileShellProps) {
  const router = useRouter();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [draft, setDraft] = useState<LoadedDraft>({
    profile: defaultFounderProfile,
    lastSavedAt: undefined,
  });

  const [activeSection, setActiveSection] =
    useState<FounderProfileSectionKey>('identity');

  const [hydrated, setHydrated] = useState(false);

  const isProgrammaticScrollRef = useRef(false);
  const releaseTimerRef = useRef<number | null>(null);

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const releaseProgrammaticScrollLock = useCallback(() => {
    isProgrammaticScrollRef.current = false;
    clearReleaseTimer();
  }, [clearReleaseTimer]);

  const scheduleProgrammaticScrollRelease = useCallback(() => {
    clearReleaseTimer();

    releaseTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      releaseTimerRef.current = null;
    }, 160);
  }, [clearReleaseTimer]);

  const handleChange = useCallback((next: FounderProfile) => {
    setDraft((current) => ({
      ...current,
      profile: next,
    }));
  }, []);

  const handleSave = useCallback(() => {
    const savedAt = persistDraft(draft.profile);

    if (savedAt) {
      setDraft((current) => ({
        ...current,
        lastSavedAt: savedAt,
      }));
    }
  }, [draft.profile]);

  useEffect(() => {
    const loaded = loadDraftFromStorage();
    setDraft(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const timeout = window.setTimeout(() => {
      const savedAt = persistDraft(draft.profile);

      if (savedAt) {
        setDraft((current) => ({
          ...current,
          lastSavedAt: savedAt,
        }));
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [draft.profile, hydrated]);

  useEffect(() => {
    const root = mainScrollRef.current;
    if (!root) return;

    const onScroll = () => {
      if (!isProgrammaticScrollRef.current) return;
      scheduleProgrammaticScrollRelease();
    };

    root.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', onScroll);
      clearReleaseTimer();
      releaseProgrammaticScrollLock();
    };
  }, [clearReleaseTimer, releaseProgrammaticScrollLock, scheduleProgrammaticScrollRelease]);

  useEffect(() => {
    const root = mainScrollRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>('section[id]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target instanceof HTMLElement) {
          const id = visible.target.id as FounderProfileSectionKey;
          setActiveSection((current) => (current === id ? current : id));
        }
      },
      {
        root,
        threshold: [0.15, 0.35, 0.6],
        rootMargin: '-10% 0px -55% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [hydrated]);

  const handleBackToApplication = useCallback(() => {
    router.push('/apply');
  }, [router]);

  const handleChangeSection = useCallback((section: FounderProfileSectionKey) => {
    setActiveSection(section);

    const root = mainScrollRef.current;
    if (!root) return;

    const target = root.querySelector<HTMLElement>(`section#${section}`);
    if (!target) return;

    isProgrammaticScrollRef.current = true;
    clearReleaseTimer();

    const top = target.offsetTop - 24;
    root.scrollTo({
      top,
      behavior: 'smooth',
    });

    scheduleProgrammaticScrollRelease();
  }, [clearReleaseTimer, scheduleProgrammaticScrollRelease]);

  return (
    <div
      className={`relative h-screen w-full overflow-hidden bg-[#05060A] text-white ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-15%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <div className="h-full w-[300px] shrink-0 border-r border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <FounderProfileSidebar
            activeSection={activeSection}
            onChangeSection={handleChangeSection}
          />
        </div>

        <main
          ref={mainScrollRef as React.RefObject<HTMLElement>}
          className="min-w-0 flex-1 overflow-y-auto scroll-smooth bg-transparent [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <FounderProfileContent value={draft.profile} onChange={handleChange} />
        </main>
      </div>
    </div>
  );
}
