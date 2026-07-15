'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

interface PhoneInputProps {
  label?: string;
  hint?: string;
  error?: string;
  countryCode?: string;
  phoneNumber?: string;
  onCountryCodeChange?: (value: string) => void;
  onPhoneNumberChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

type CountryOption = {
  value: string;
  label: string;
  dialCode: string;
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatGroupedDigits(value: string): string {
  const digits = onlyDigits(value).slice(0, 15);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export default function PhoneInput({
  label,
  hint,
  error,
  countryCode = '',
  phoneNumber = '',
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
  disabled = false,
  className = '',
}: PhoneInputProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [touched, setTouched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [open]);

  const countryNames = useMemo(() => {
    if (!mounted) return null;
    return new Intl.DisplayNames(['en'], { type: 'region' });
  }, [mounted]);

  const options = useMemo<CountryOption[]>(() => {
    if (!mounted || !countryNames) return [];

    return getCountries()
      .map((country) => {
        const dialCode = getCountryCallingCode(country as CountryCode);
        const name = countryNames.of(country) ?? country;

        return {
          value: country,
          label: `${name} (+${dialCode})`,
          dialCode: `+${dialCode}`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [mounted, countryNames]);

  const selected = useMemo(() => {
    return options.find((option) => option.value === countryCode) ?? null;
  }, [options, countryCode]);

  const phonePrefix = selected?.dialCode ?? '+';

  const displayedPhoneNumber = useMemo(() => {
    if (!phoneNumber) return '';
    return formatGroupedDigits(phoneNumber);
  }, [phoneNumber]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;

    return options.filter((option) => {
      return (
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q) ||
        option.dialCode.toLowerCase().includes(q)
      );
    });
  }, [options, search]);

  const validationMessage = useMemo(() => {
    if (!touched) return '';

    const digits = onlyDigits(phoneNumber);

    if (!digits || !countryCode) {
      return 'Enter a valid phone number.';
    }

    try {
      const fullNumber = `${phonePrefix}${digits}`;
      if (!isValidPhoneNumber(fullNumber)) {
        return 'Enter a valid phone number.';
      }
    } catch {
      return 'Enter a valid phone number.';
    }

    return '';
  }, [countryCode, phoneNumber, phonePrefix, touched]);

  const inputBase = `
    input
    !pl-16
    !pr-4
    ${error || validationMessage ? 'border-red-500/40 focus:border-red-500/50' : ''}
  `;

  return (
    <div ref={wrapperRef} className={`w-full flex flex-col gap-2 ${className}`}>
      {label ? (
        <label className="text-sm font-medium text-white/60">
          {label}
          {required ? <span className="ml-1 text-white/45">*</span> : null}
        </label>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)]">
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
            className="
              input
              flex items-center justify-between gap-3 text-left
              disabled:cursor-not-allowed disabled:opacity-50
            "
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="truncate text-sm text-white/80">
              {mounted ? selected?.label ?? 'Select country code' : 'Select country code'}
            </span>

            <span className="shrink-0 text-xs text-white/45">
              {mounted && selected ? selected.dialCode : ''}
            </span>
          </button>

          {open && !disabled ? (
            <div
              className="
                absolute left-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden
                rounded-2xl border border-white/10 bg-[#070b16]
                shadow-[0_24px_80px_rgba(0,0,0,.55)]
              "
            >
              <div className="border-b border-white/10 p-3">
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="
                    input h-10 rounded-xl
                  "
                />
              </div>

              <div
                className="
                  max-h-64 overflow-auto py-1
                  [scrollbar-width:none]
                  [-ms-overflow-style:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange?.(option.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="
                      block w-full px-4 py-3 text-left text-sm text-white/80
                      transition-colors duration-200 hover:bg-white/5 hover:text-white
                    "
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate">{option.label}</span>
                      <span className="shrink-0 text-xs text-white/45">
                        {option.dialCode}
                      </span>
                    </span>
                  </button>
                ))}

                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-white/45">
                    No countries found
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-white/45">
            {phonePrefix}
          </span>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={displayedPhoneNumber}
            disabled={disabled}
            placeholder="1234 5678 9012"
            onFocus={() => setTouched(true)}
            onBlur={() => setTouched(true)}
            onChange={(e) => {
              const raw = e.target.value;
              const digits = onlyDigits(raw).slice(0, 15);
              onPhoneNumberChange?.(digits);
            }}
            className={inputBase}
            aria-label="Phone number"
            aria-invalid={!!(error || validationMessage)}
          />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
      ) : validationMessage ? (
        <p className="text-xs text-red-400/80 leading-relaxed">
          {validationMessage}
        </p>
      ) : hint ? (
        <p className="text-xs text-white/30 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}