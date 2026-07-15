'use client';

import React from 'react';

import type { FounderProfile } from './founder-profile-types';

import Headline from './ui/Headline';
import Responsibilities from './sections/ResponsibilitiesCommitment';
import Background from './sections/Background';
import Accomplishments from './sections/Accomplishments';
import Identity from './sections/Identity';

interface FounderProfileContentProps {
  value: FounderProfile;
  onChange: (next: FounderProfile) => void;
  className?: string;
}

export default function FounderProfileContent({
  value,
  onChange,
  className = '',
}: FounderProfileContentProps) {
  const updateSection = <K extends keyof FounderProfile>(
    section: K,
    nextSectionValue: FounderProfile[K]
  ) => {
    onChange({
      ...value,
      [section]: nextSectionValue,
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mx-auto w-full max-w-5xl space-y-10 px-6 py-10 lg:px-10">
        <Headline
          title="Founder Profile"
        />

        <section id="identity" className="scroll-mt-8">
          <Identity
            data={value.identity}
            onChange={(next) => updateSection('identity', next)}
          />
        </section>

        <section id="responsibilities_commitment" className="scroll-mt-8">
          <Responsibilities
            data={value.responsibilities}
            onChange={(next) => updateSection('responsibilities', next)}
          />
        </section>

        <section id="background" className="scroll-mt-8">
          <Background
            data={value.background}
            onChange={(next) => updateSection('background', next)}
          />
        </section>

        <section id="accomplishments" className="scroll-mt-8">
          <Accomplishments
            data={value.accomplishments}
            onChange={(next) => updateSection('accomplishments', next)}
          />
        </section>
      </div>
    </div>
  );
}