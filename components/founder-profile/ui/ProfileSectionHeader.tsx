'use client';

import React from 'react';

interface ProfileSectionHeaderProps {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export default function ProfileSectionHeader({
  title,
  description,
  rightSlot,
  className = '',
}: ProfileSectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-[1.75rem]">
          {title}
        </h2>

        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-white/55">
            {description}
          </p>
        ) : null}
      </div>

      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
