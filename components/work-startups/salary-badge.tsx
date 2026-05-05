"use client";

import { motion } from "framer-motion";

type Props = {
  min?: number;
  max?: number;
  currency?: string;
  period?: "year" | "month" | "hour";
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
};

function formatSalary(value?: number) {
  if (!value) return null;
  return value.toLocaleString("en-US");
}

export default function SalaryBadge({
  min,
  max,
  currency = "$",
  period = "year",
  size = "md",
  highlight = false,
}: Props) {
  const minVal = formatSalary(min);
  const maxVal = formatSalary(max);

  const sizeStyles = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        inline-flex items-center gap-2 rounded-full
        border border-white/10
        bg-white/5 backdrop-blur-xl
        text-gray-200
        ${sizeStyles[size]}
        ${highlight ? "shadow-[0_0_25px_rgba(108,140,255,0.25)] border-[#6C8CFF]/40" : ""}
        transition-all
      `}
    >
      {/* ICON DOT */}
      <span
        className={`
          w-2 h-2 rounded-full
          ${highlight ? "bg-[#6C8CFF]" : "bg-gray-500"}
        `}
      />

      {/* TEXT */}
      <span className="font-medium tracking-tight">
        {minVal && maxVal
          ? `${currency}${minVal} – ${currency}${maxVal}`
          : minVal
          ? `From ${currency}${minVal}`
          : "Competitive"}

        <span className="text-gray-500 font-normal ml-1">
          /{period}
        </span>
      </span>
    </motion.div>
  );
}