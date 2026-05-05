// ===============================================
// FILE: components/faq/faq-search.tsx
// ===============================================
"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function FAQSearch({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      {/* INPUT WRAPPER */}
      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 transition">
        {/* ICON */}
        <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />

        {/* INPUT */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search common questions..."
          autoComplete="off"
          spellCheck={false}
          className="
            w-full bg-transparent text-white text-sm
            placeholder:text-gray-500
            outline-none border-none ring-0
            focus:outline-none focus:ring-0 focus:border-none
          "
        />

        {/* CLEAR BUTTON */}
        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-3 text-gray-500 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}