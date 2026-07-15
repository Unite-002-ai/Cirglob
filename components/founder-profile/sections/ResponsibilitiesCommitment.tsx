'use client';

import React from 'react';

import ProfileSectionHeader from '../ui/ProfileSectionHeader';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import Radio from '../ui/Radio';

import type { ResponsibilitiesData } from '../founder-profile-types';

interface ResponsibilitiesProps {
  data: ResponsibilitiesData;
  onChange: (data: ResponsibilitiesData) => void;
  errors?: Partial<Record<keyof ResponsibilitiesData, string>>;
}

export default function Responsibilities({
  data,
  onChange,
  errors = {},
}: ResponsibilitiesProps) {
  const extendedData = data as ResponsibilitiesData & {
    twelveMonthCommitmentExplanation?: string;
  };

  const extendedErrors = errors as Partial<
    Record<keyof ResponsibilitiesData | 'twelveMonthCommitmentExplanation', string>
  >;

  const updateField = <K extends keyof ResponsibilitiesData>(
    key: K,
    value: ResponsibilitiesData[K]
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const updateCommitmentExplanation = (value: string) => {
    onChange({
      ...data,
      twelveMonthCommitmentExplanation: value,
    } as ResponsibilitiesData);
  };

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="Responsibilities & Commitment"
        description="Understand what this founder owns, how critical they are to execution, and how committed they are to building the company long-term."
      />

      <Textarea
        label="What are your primary responsibilities within the company?"
        value={data.mainResponsibilities}
        onChange={(v) => updateField('mainResponsibilities', v)}
        error={errors.mainResponsibilities}
        placeholder="Describe what you personally own, build, lead, or execute day-to-day."
        required
      />

      <div className="space-y-2">
        <Input
          label="What percentage of the company do you own?"
          type="text"
          value={data.equityPercentage ?? ''}
          onChange={(v) => {
            const cleaned = v.replace(/[^\d.]/g, '');
            if (cleaned.trim() === '' || cleaned === '.') {
              updateField('equityPercentage', null);
              return;
            }

            const numeric = Number(cleaned);
            updateField('equityPercentage', Number.isFinite(numeric) ? numeric : null);
          }}
          error={errors.equityPercentage}
          placeholder="50%"
          required
          inputMode="decimal"
        />
        <p className="text-sm text-muted-foreground">
          If the company is not yet incorporated, provide the expected equity split.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Radio
            label="Are you a technical founder?"
            value={data.isTechnicalFounder}
            onChange={(v) => updateField('isTechnicalFounder', v as 'yes' | 'no' | '')}
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]}
            error={errors.isTechnicalFounder}
            required
          />
        </div>

        {data.isTechnicalFounder === 'no' ? (
          <Textarea
            label="What do you personally lead or own?"
            value={data.technicalOwnership}
            onChange={(v) => updateField('technicalOwnership', v)}
            error={errors.technicalOwnership}
            placeholder="Sales, operations, product, growth, partnerships, recruiting, research, or other core functions."
            required
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <Radio
          label="Are you currently working on this company full-time?"
          value={data.isFullTime}
          onChange={(v) => updateField('isFullTime', v as 'yes' | 'no' | '')}
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          error={errors.isFullTime}
          required
        />

        {data.isFullTime === 'no' ? (
          <Textarea
            label="Explain your timeline toward full-time commitment."
            value={data.fullTimeTimelineExplanation}
            onChange={(v) => updateField('fullTimeTimelineExplanation', v)}
            error={errors.fullTimeTimelineExplanation}
            placeholder="Explain your current situation, transition plan, and expected timing."
            required
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <Radio
          label="If accepted into Cirglob, will you commit fully to building this company for the next 12 months?"
          value={data.twelveMonthCommitment}
          onChange={(v) => updateField('twelveMonthCommitment', v as 'yes' | 'no' | '')}
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          error={errors.twelveMonthCommitment}
          required
        />

        {data.twelveMonthCommitment === 'no' ? (
          <Textarea
            label="Please explain."
            value={extendedData.twelveMonthCommitmentExplanation ?? ''}
            onChange={updateCommitmentExplanation}
            error={extendedErrors.twelveMonthCommitmentExplanation}
            placeholder="Explain any competing commitments, obligations, or constraints."
            required
          />
        ) : null}
      </div>
    </div>
  );
}
