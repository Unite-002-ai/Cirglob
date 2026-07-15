'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Input from './Input';
import type { EducationData } from '../founder-profile-types';

interface EducationDropdownProps {
  value: EducationData | null;
  onChange: (value: EducationData | null) => void;
}

function emptyEducation(): EducationData {
  return {
    schoolName: '',
    degreeTypeOrLevel: '',
    fieldOfStudy: '',
    from: '',
    to: '',
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

function EducationForm({
  value,
  onChange,
}: {
  value: EducationData;
  onChange: (next: EducationData) => void;
}) {
  const labelBase = 'text-sm font-medium text-white/80';
  const helperBase = 'text-xs leading-relaxed text-white/45';

  return (
    <div className="space-y-5">
      <Input
        label="School name"
        value={value.schoolName}
        onChange={(v) => onChange({ ...value, schoolName: v })}
        placeholder="Stanford University"
        required
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Degree type or level"
          value={value.degreeTypeOrLevel}
          onChange={(v) => onChange({ ...value, degreeTypeOrLevel: v })}
          placeholder="Bachelor's Degree"
        />

        <Input
          label="Field of study"
          value={value.fieldOfStudy}
          onChange={(v) => onChange({ ...value, fieldOfStudy: v })}
          placeholder="Computer Science"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelBase}>From</label>
          <Input
            type="month"
            value={value.from}
            onChange={(v) => onChange({ ...value, from: v })}
          />
          <p className={helperBase}>Start date of this education.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className={labelBase}>To</label>

            <div className="group relative">
              <button
                type="button"
                className="
                  flex h-5 w-5 items-center justify-center rounded-full
                  border border-white/10 bg-white/[0.03] text-[10px] font-semibold
                  text-white transition-all duration-200
                  text-white/60 transition-all duration-200
                  hover:border-blue-400/30 hover:bg-white/[0.06] hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20
                "
                aria-label="If you are still in school include the expected graduation date"
              >
                i
              </button>

              <div
                className="
                  pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72
                  -translate-x-1/2 rounded-2xl border border-white/10
                  bg-[#0b1020] px-3 py-2 text-xs leading-relaxed
                  text-white/65 shadow-[0_24px_80px_rgba(0,0,0,.55)]
                  backdrop-blur-xl group-hover:block
                "
              >
                If you are still in school, use your expected graduation date.
              </div>
            </div>
          </div>

          <Input
            type="month"
            value={value.to}
            onChange={(v) => onChange({ ...value, to: v })}
          />
          <p className={helperBase}>End date or expected graduation date.</p>
        </div>
      </div>
    </div>
  );
}

export default function EducationDropdown({
  value,
  onChange,
}: EducationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EducationData>(value ?? emptyEducation());

  useEffect(() => {
    setDraft(value ?? emptyEducation());
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  const hasEducation = !!value?.schoolName?.trim();

  const summary = useMemo(() => {
    if (!value || !value.schoolName.trim()) {
      return 'No education history';
    }

    const parts = [value.schoolName, value.degreeTypeOrLevel, value.fieldOfStudy].filter(Boolean);

    const dates =
      value.from || value.to
        ? [
            value.from ? formatMonthYear(value.from) : '',
            value.to ? formatMonthYear(value.to) : '',
          ]
            .filter(Boolean)
            .join(' — ')
        : '';

    return [parts.join(' · '), dates].filter(Boolean).join(' | ');
  }, [value]);

  const canSave = draft.schoolName.trim().length > 0;

  const saveEducation = () => {
    const cleaned: EducationData = {
      schoolName: draft.schoolName.trim(),
      degreeTypeOrLevel: draft.degreeTypeOrLevel.trim(),
      fieldOfStudy: draft.fieldOfStudy.trim(),
      from: draft.from.trim(),
      to: draft.to.trim(),
    };

    if (!cleaned.schoolName) return;

    onChange(cleaned);
    setOpen(false);
  };

  const clearEducation = () => {
    setDraft(emptyEducation());
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <label className="text-sm font-medium text-white/80">
              Education <span className="ml-1 text-white/45">*</span>
            </label>

            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Add your college and any advanced degrees. If you did not attend college,
              list the last school you attended.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
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
            {hasEducation ? 'Edit education' : 'Add education'}
          </button>
        </div>

        <div
          className="
            rounded-2xl border border-white/10 bg-white/[0.03]
            px-4 py-3 text-sm text-white/72
            shadow-[0_14px_40px_rgba(0,0,0,.18)]
            backdrop-blur-sm
          "
        >
          <span className="text-white/45">{summary}</span>
        </div>
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
                    Add Education
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
                    Save one education record for your profile.
                  </p>
                </div>

                {hasEducation ? (
                  <button
                    type="button"
                    onClick={clearEducation}
                    className="
                      inline-flex items-center justify-center rounded-full
                      border border-red-500/20 bg-red-500/10 px-4 py-2
                      text-xs font-medium text-red-200
                      transition-all duration-200
                      hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-100
                      focus:outline-none focus:ring-2 focus:ring-red-500/20
                    "
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <EducationForm value={draft} onChange={setDraft} />

              <div className="mt-7 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    inline-flex items-center justify-center rounded-full
                    border border-white/10 bg-white/[0.03] px-5 py-2.5
                    text-sm font-medium text-white/75
                    transition-all duration-200
                    hover:border-white/20 hover:bg-white/[0.06] hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-white/10
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEducation}
                  disabled={!canSave}
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
                  Save education
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
