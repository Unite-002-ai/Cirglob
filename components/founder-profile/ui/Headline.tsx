'use client';

import React from 'react';

interface HeadlineProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function Headline({
  title,
  subtitle,
  className = '',
}: HeadlineProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-white/55">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
