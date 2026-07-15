'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface LocationAutocompleteProps {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

type NominatimResult = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country_code?: string;
  };
};

function formatResult(result: NominatimResult): string {
  const address = result.address ?? {};

  const primary =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.hamlet ||
    address.suburb ||
    address.county ||
    '';

  const state = address.state ?? '';
  const countryCode = address.country_code
    ? address.country_code.toUpperCase()
    : '';

  const parts = [primary, state, countryCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : result.display_name ?? '';
}

export default function LocationAutocomplete({
  label,
  hint,
  error,
  placeholder = 'Search city, state, country...',
  value = '',
  onChange,
  required = false,
  disabled = false,
  className = '',
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) return;

        const data = (await response.json()) as NominatimResult[];
        const formatted = data
          .map(formatResult)
          .filter((item, index, arr) => item && arr.indexOf(item) === index);

        setResults(formatted);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const canShowResults = useMemo(
    () => open && results.length > 0 && !disabled,
    [disabled, open, results.length]
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full flex-col gap-2 ${className}`}
    >
      {label ? (
        <label className="text-sm font-medium text-white/80">
          {label}
          {required ? <span className="ml-1 text-white/45">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <input
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            onChange?.(next);
            setOpen(true);
          }}
          className={`
            input
              ${error ? "border-red-500/40 focus:border-red-500/50" : ""}
              ${className}
          `}
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={canShowResults}
        />

        {canShowResults ? (
          <div
            className="
              absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl
              border border-white/10 bg-[#070b16]
              shadow-[0_30px_120px_rgba(0,0,0,.7)]
              backdrop-blur-xl
              scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15
              hover:scrollbar-thumb-white/20
            "
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.14) transparent',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            {results.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                className="
                  block w-full px-4 py-3 text-left text-sm text-white/80
                  transition-colors duration-200
                  hover:bg-white/[0.05] hover:text-white
                  focus:bg-white/[0.05] focus:text-white focus:outline-none
                "
                onClick={() => {
                  onChange?.(item);
                  setQuery(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {hint && !error ? <p className="text-xs text-white/45">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400/80">{error}</p> : null}
    </div>
  );
}
