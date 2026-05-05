"use client";

import React from "react";

type ErrorTextProps = {
  message?: string;
  className?: string;
};

export default function ErrorText({
  message,
  className = "",
}: ErrorTextProps) {
  if (!message) return null;

  return (
    <p
      className={`
        text-xs text-red-400/80
        leading-relaxed
        pl-1
        animate-[fadeIn_0.2s_ease-out]
        ${className}
      `}
    >
      {message}
    </p>
  );
}