'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Input from './Input';
import Textarea from './Textarea';
import type { WorkExperienceData } from '../founder-profile-types';

interface WorkHistoryDropdownProps {
  value: WorkExperienceData[];
  onChange: (value: WorkExperienceData[]) => void;
  error?: string;
}

function emptyExperience(): WorkExperienceData {
  return {
    companyName: '',
    position: '',
    from: '',
    to: '',
    isCurrentPosition: false,
    description: '',
  };
}

function formatMonthYear(value: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatExperienceSummary(item: WorkExperienceData): string {
  const parts = [item.companyName, item.position].filter(Boolean);
  const from = formatMonthYear(item.from);
  const to = formatMonthYear(item.to);
  const datePart = item.isCurrentPosition
    ? from
      ? `${from} — Present`
      : 'Present'
    : [from, to].filter(Boolean).join(' — ');

  return [parts.join(' · '), datePart].filter(Boolean).join(' | ');
}

function FieldToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="
        flex h-12 w-full items-center justify-between rounded-2xl border
        border-white/10 bg-white/[0.03] px-4 text-sm text-white/80
        shadow-[0_10px_30px_rgba(0,0,0,.14)]
        transition-all duration-200
        hover:border-blue-400/25 hover:bg-white/[0.05] hover:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-400/20
      "
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
            checked
              ? 'border-blue-400 bg-blue-400'
              : 'border-white/20 bg-transparent'
          }`}
        >
          {checked ? (
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3 text-white"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.42.004L3.29 9.18a1 1 0 1 1 1.42-1.405l3.096 3.13 6.49-6.533a1 1 0 0 1 1.408-.006Z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </span>

        <span>Current position</span>
      </span>
    </button>
  );
}

function ExperienceForm({
  value,
  onChange,
}: {
  value: WorkExperienceData;
  onChange: (next: WorkExperienceData) => void;
}) {
  const labelBase = 'text-sm font-medium text-white/80';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Company"
          value={value.companyName}
          onChange={(v) => onChange({ ...value, companyName: v })}
          placeholder="OpenAI"
          required
        />

        <Input
          label="Position"
          value={value.position}
          onChange={(v) => onChange({ ...value, position: v })}
          placeholder="Founder"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          type="month"
          label="From"
          value={value.from}
          onChange={(v) => onChange({ ...value, from: v })}
          required
        />

        <Input
          type="month"
          label="To"
          value={value.to}
          onChange={(v) => onChange({ ...value, to: v })}
          required={!value.isCurrentPosition}
          disabled={value.isCurrentPosition}
        />

        <div className="space-y-2">
          <label className={labelBase}>Status</label>
          <FieldToggle
            checked={value.isCurrentPosition}
            onChange={(nextChecked) =>
              onChange({
                ...value,
                isCurrentPosition: nextChecked,
                to: nextChecked ? '' : value.to,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          label="What did you work on?"
          value={value.description}
          onChange={(v) => onChange({ ...value, description: v })}
          placeholder="Optional. Example: Led product, engineering, and launch execution."
        />
      </div>
    </div>
  );
}

export default function WorkHistoryDropdown({
  value,
  onChange,
  error,
}: WorkHistoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WorkExperienceData>(emptyExperience());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  const hasWorkHistory = value.length > 0;

  const summary = useMemo(() => {
    if (!hasWorkHistory) return 'No work history';

    if (value.length === 1) {
      return formatExperienceSummary(value[0]);
    }

    return `${value.length} work experiences added`;
  }, [hasWorkHistory, value]);

  const canSaveExperience =
    draft.companyName.trim().length > 0 &&
    draft.position.trim().length > 0 &&
    draft.from.trim().length > 0 &&
    (draft.isCurrentPosition || draft.to.trim().length > 0);

  const openNewExperience = () => {
    setDraft(emptyExperience());
    setEditingIndex(null);
    setOpen(true);
  };

  const openEditExperience = (index: number) => {
    setDraft(value[index] ?? emptyExperience());
    setEditingIndex(index);
    setOpen(true);
  };

  const saveExperience = () => {
    const cleaned: WorkExperienceData = {
      companyName: draft.companyName.trim(),
      position: draft.position.trim(),
      from: draft.from.trim(),
      to: draft.isCurrentPosition ? '' : draft.to.trim(),
      isCurrentPosition: draft.isCurrentPosition,
      description: draft.description.trim(),
    };

    if (!cleaned.companyName || !cleaned.position || !cleaned.from) return;
    if (!cleaned.isCurrentPosition && !cleaned.to) return;

    const next = [...value];

    if (editingIndex === null) {
      next.push(cleaned);
    } else {
      next[editingIndex] = cleaned;
    }

    onChange(next);
    setOpen(false);
  };

  const removeExperience = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <label className="text-sm font-medium text-white/80">
              Work History <span className="ml-1 text-white/45">*</span>
            </label>

            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Should you be accepted, we may ask for references.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewExperience}
            className="
              inline-flex items-center justify-center rounded-full
              border border-white/10 bg-white/[0.03] px-4 py-2
              text-xs font-medium text-white/80
              shadow-[0_10px_30px_rgba(0,0,0,.18)]
              transition-all duration-200
              hover:border-blue-400/25 hover:bg-white/[0.06] hover:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-400/20
            "
          >
            Add experience
          </button>
        </div>

        <div
          className={`
            rounded-2xl border px-4 py-3 text-sm shadow-[0_14px_40px_rgba(0,0,0,.18)]
            backdrop-blur-sm
            ${
              error
                ? 'border-red-500/30 bg-red-500/10 text-red-200'
                : 'border-white/10 bg-white/[0.03] text-white/72'
            }
          `}
        >
          <span className={error ? '' : 'text-white/45'}>{summary}</span>
        </div>

        {hasWorkHistory ? (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div
                key={`${item.companyName}-${item.position}-${index}`}
                className="
                  rounded-2xl border border-white/10 bg-white/[0.03] p-4
                  shadow-[0_12px_40px_rgba(0,0,0,.16)]
                "
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-white">
                      {item.companyName || 'Untitled company'}
                    </div>
                    <div className="text-sm text-white/70">
                      {item.position || 'Untitled position'}
                    </div>
                    <div className="text-xs text-white/45">
                      {item.isCurrentPosition
                        ? `${formatMonthYear(item.from) || 'Start date'} — Present`
                        : `${formatMonthYear(item.from) || 'Start date'} — ${formatMonthYear(item.to) || 'End date'}`}
                    </div>
                    {item.description ? (
                      <p className="pt-1 text-sm leading-relaxed text-white/65">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditExperience(index)}
                      className="
                        rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5
                        text-xs font-medium text-white/75 transition-all
                        hover:border-blue-400/25 hover:bg-white/[0.06] hover:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-400/20
                      "
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="
                        rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5
                        text-xs font-medium text-red-200 transition-all
                        hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-100
                        focus:outline-none focus:ring-2 focus:ring-red-500/20
                      "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020308]/75 px-4 backdrop-blur-xl">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            className="
              relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px]
              border border-white/10 bg-[#070b16]
              shadow-[0_30px_120px_rgba(0,0,0,.7)]
            "
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
            <div className="absolute -left-24 top-[-120px] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -right-24 top-[-120px] h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative p-6 md:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {editingIndex === null ? 'Add Experience' : 'Edit Experience'}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
                    Save one work experience record for your profile.
                  </p>
                </div>
              </div>

              <ExperienceForm value={draft} onChange={setDraft} />

              <div className="mt-7 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    inline-flex items-center justify-center rounded-full
                    border border-white/10 bg-white/[0.03] px-5 py-2.5
                    text-sm font-medium text-white/75 transition-all duration-200
                    hover:border-white/20 hover:bg-white/[0.06] hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-white/10
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveExperience}
                  disabled={!canSaveExperience}
                  className="
                    inline-flex items-center justify-center rounded-full
                    border border-blue-400/25 bg-gradient-to-r from-blue-500/20 to-indigo-500/20
                    px-5 py-2.5 text-sm font-medium text-white
                    shadow-[0_16px_40px_rgba(59,130,246,.12)]
                    transition-all duration-200
                    hover:border-blue-400/35 hover:from-blue-500/25 hover:to-indigo-500/25
                    focus:outline-none focus:ring-2 focus:ring-blue-400/20
                    disabled:cursor-not-allowed disabled:opacity-45
                  "
                >
                  {editingIndex === null ? 'Save experience' : 'Update experience'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
