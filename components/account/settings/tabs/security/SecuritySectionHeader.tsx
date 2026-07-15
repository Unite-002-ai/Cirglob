"use client";

import React from "react";

type SecuritySectionHeaderProps = {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
};

export default function SecuritySectionHeader({
  title,
  description,
  rightSlot,
}: SecuritySectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {/* LEFT CONTENT */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white tracking-tight">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-white/40 leading-relaxed max-w-md">
            {description}
          </p>
        )}
      </div>

      {/* RIGHT ACTION SLOT */}
      {rightSlot && (
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
