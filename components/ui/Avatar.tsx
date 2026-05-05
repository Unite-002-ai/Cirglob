"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  showBorder?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 40,
  showBorder = true,
  className = "",
}: AvatarProps) {
  const [error, setError] = useState(false);

  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-white/5 backdrop-blur-xl ${
        showBorder ? "border border-white/10" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >

      {/* IMAGE STATE */}
      {src && !error ? (
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        /* FALLBACK STATE */
        <div className="flex items-center justify-center w-full h-full text-xs font-medium text-gray-300">
          {initials}
        </div>
      )}

      {/* SUBTLE INNER GLOW (CIRGLOB SIGNATURE DETAIL) */}
      <div className="absolute inset-0 ring-1 ring-white/5 rounded-full pointer-events-none" />
    </div>
  );
}

/* ---------------- UTIL ---------------- */

function getInitials(name?: string) {
  if (!name) return "U";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}