'use client';

import React from 'react';

import ProfileSectionHeader from '../ui/ProfileSectionHeader';
import Textarea from '../ui/Textarea';

import type { AccomplishmentsData } from '../founder-profile-types';

interface AccomplishmentsProps {
  data: AccomplishmentsData;
  onChange: (data: AccomplishmentsData) => void;
  errors?: Partial<Record<keyof AccomplishmentsData, string>>;
}

export default function Accomplishments({
  data,
  onChange,
  errors = {},
}: AccomplishmentsProps) {
  const updateField = <K extends keyof AccomplishmentsData>(
    key: K,
    value: AccomplishmentsData[K]
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="Accomplishments"
        description="Understand how this founder thinks, builds, solves difficult problems, and turns ideas into meaningful outcomes."
      />

      <Textarea
        label="What is the most impressive thing you have built, achieved, or figured out outside this startup? *"
        value={data.mostImpressiveAchievement}
        onChange={(v) => updateField('mostImpressiveAchievement', v)}
        error={errors.mostImpressiveAchievement}
        placeholder="Focus on difficult problems, exceptional execution, unusual initiative, or meaningful real-world impact."
        required
      />

      <Textarea
        label="Tell us about products, systems, research, experiments, or projects you have built before. Include links if possible. *"
        value={data.pastProjects}
        onChange={(v) => updateField('pastProjects', v)}
        error={errors.pastProjects}
        placeholder="Explain what you built, why you built it, and what impact or outcome it created."
        required
      />

      <Textarea
        label="Tell us about a time you solved a difficult problem in a resourceful or unconventional way. *"
        value={data.unconventionalProblemSolving}
        onChange={(v) => updateField('unconventionalProblemSolving', v)}
        error={errors.unconventionalProblemSolving}
        placeholder="We are interested in how you think, adapt, and operate under constraints."
        required
      />

      <Textarea
        label="What evidence best demonstrates your exceptional ability?"
        value={data.additionalSignals}
        onChange={(v) => updateField('additionalSignals', v)}
        error={errors.additionalSignals}
        placeholder="Awards, research, open source, competitions, publications, patents, communities, or other meaningful proof of ability."
      />
    </div>
  );
}
