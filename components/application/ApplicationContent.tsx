// ===============================================
// FILE: components/application/ApplicationContent.tsx
// ===============================================
"use client";

import React from "react";

import Founders from "./sections/Founders";
import FounderVideo from "./sections/FounderVideo";
import Company from "./sections/Company";
import Progress from "./sections/Progress";
import Idea from "./sections/Idea";
import Equity from "./sections/Equity";
import Curious from "./sections/Curious";
import BatchPreference from "./sections/BatchPreference";

type SectionKey =
  | "founders"
  | "video"
  | "company"
  | "progress"
  | "idea"
  | "equity"
  | "curious"
  | "batch";

const SECTIONS: {
  key: SectionKey;
  label: string;
  component: React.ReactNode;
}[] = [
  { key: "founders", label: "Founders", component: <Founders /> },
  { key: "video", label: "Founder Video", component: <FounderVideo /> },
  { key: "company", label: "Company", component: <Company /> },
  { key: "progress", label: "Progress", component: <Progress /> },
  { key: "idea", label: "Idea", component: <Idea /> },
  { key: "equity", label: "Equity", component: <Equity /> },
  { key: "curious", label: "Curious", component: <Curious /> },
  { key: "batch", label: "Batch Preference", component: <BatchPreference /> },
];

export default function ApplicationContent() {
  return (
    <div className="max-w-4xl">
      <div className="max-w-3xl">
        <h1 className="text-[34px] md:text-[52px] leading-tight font-semibold tracking-tight text-white">
          Founder Application
        </h1>

        <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
          Complete the sections below and share the team, company, progress,
          idea, equity, and batch preference details.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {SECTIONS.map((section) => (
          <section
            key={section.key}
            id={section.key}
            data-section={section.key}
            className="space-y-6 scroll-mt-8"
          >
            {section.component}
          </section>
        ))}
        
      </div>
    </div>
  );
}