'use client';

import { motion } from 'framer-motion';

import CirglobBrand from '@/components/CirglobBrand';

import {
  FOUNDER_PROFILE_SECTION_LABELS,
  FOUNDER_PROFILE_SECTION_ORDER,
  type FounderProfileSection,
} from '@/lib/constants';

type Props = {
  activeSection: FounderProfileSection;
  onChangeSection: (section: FounderProfileSection) => void;
  className?: string;
};

export default function FounderProfileSidebar({
  activeSection,
  onChangeSection,
  className = "",
}: Props) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden px-5 py-6 text-white ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[-20%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="-ml-1 -mt-1">
          <div className="origin-left scale-[0.84]">
            <CirglobBrand />
          </div>
        </div>

        <div className="mt-5 h-px bg-white/10" />

        <nav className="mt-5 space-y-2" aria-label="Founder profile sections">
          {FOUNDER_PROFILE_SECTION_ORDER.map((section) => {
            const active = activeSection === section;

            return (
              <button
                key={section}
                type="button"
                onClick={() => onChangeSection(section)}
                aria-current={active ? "page" : undefined}
                className="relative w-full rounded-xl px-3.5 py-3.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              >
                {active && (
                  <>
                    <motion.div
                      layoutId="founder-profile-sidebar-active-tab"
                      className="absolute inset-0 rounded-xl border border-white/10 bg-white/10"
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 26,
                        mass: 0.8,
                      }}
                    />
                    <motion.div
                      layoutId="founder-profile-sidebar-active-line"
                      className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-blue-500"
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 26,
                        mass: 0.8,
                      }}
                    />
                  </>
                )}

                <span
                  className={`relative z-10 block whitespace-nowrap tracking-tight transition-colors duration-200 ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {FOUNDER_PROFILE_SECTION_LABELS[section]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}