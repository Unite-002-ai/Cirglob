'use client';

import React from 'react';

import ProfileSectionHeader from '../ui/ProfileSectionHeader';
import Input from '../ui/Input';
import EducationDropdown from '../ui/EducationDropdown';
import WorkHistoryDropdown from '../ui/WorkHistoryDropdown';

import type { BackgroundData } from '../founder-profile-types';

interface BackgroundProps {
  data: BackgroundData;
  onChange: (data: BackgroundData) => void;
  errors?: Partial<Record<keyof BackgroundData, string>>;
}

export default function Background({
  data,
  onChange,
  errors = {},
}: BackgroundProps) {
  const updateField = <K extends keyof BackgroundData>(
    key: K,
    value: BackgroundData[K]
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="Background"
        description="Relevant experience, work history, and online presence."
      />

      <div className="space-y-4">
        <Input
          label="LinkedIn URL"
          type="url"
          value={data.linkedInUrl}
          onChange={(v) => updateField('linkedInUrl', v)}
          error={errors.linkedInUrl}
          placeholder="https://linkedin.com/in/..."
          autoComplete="url"
        />

        <Input
          label="GitHub URL"
          type="url"
          value={data.githubUrl}
          onChange={(v) => updateField('githubUrl', v)}
          error={errors.githubUrl}
          placeholder="https://github.com/..."
          autoComplete="url"
        />

        <Input
          label="Personal website"
          type="url"
          value={data.personalWebsite}
          onChange={(v) => updateField('personalWebsite', v)}
          error={errors.personalWebsite}
          placeholder="https://yourdomain.com"
          autoComplete="url"
        />

        <Input
          label="X / Twitter URL"
          type="url"
          value={data.twitterUrl}
          onChange={(v) => updateField('twitterUrl', v)}
          error={errors.twitterUrl}
          placeholder="https://x.com/..."
          autoComplete="url"
        />
      </div>

      <WorkHistoryDropdown
        value={data.workHistory}
        onChange={(next) => updateField('workHistory', next)}
        error={errors.workHistory}
      />

      <EducationDropdown
        value={data.education}
        onChange={(next) => updateField('education', next)}
      />
    </div>
  );
}
