"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        "shadow-[0_16px_60px_rgba(0,0,0,0.24)] p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-sm font-medium tracking-tight text-white/80 mb-5",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Grid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>{children}</div>;
}

export function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
        {label}
      </span>
      <span className="text-sm text-white/80 leading-relaxed">{value}</span>
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3",
        "text-sm text-white placeholder:text-white/30",
        "outline-none transition focus:border-white/20 focus:bg-white/[0.07]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-28 rounded-xl border border-white/10 bg-white/5 px-4 py-3",
        "text-sm text-white placeholder:text-white/30",
        "outline-none transition focus:border-white/20 focus:bg-white/[0.07]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3",
        "text-sm text-white outline-none transition",
        "focus:border-white/20 focus:bg-white/[0.07]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}

export function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between gap-4 rounded-xl border border-white/10",
        "bg-white/5 px-4 py-3 text-left transition hover:bg-white/[0.07]"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm text-white/85">{label}</span>
        {description && <span className="text-xs text-white/35">{description}</span>}
      </div>

      <span
        className={cn(
          "h-6 w-11 rounded-full p-1 transition",
          enabled ? "bg-emerald-500/80" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-white transition-transform",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
    </button>
  );
}

export function ActionButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium",
        "border border-white/10 bg-white/5 text-white/85 transition",
        "hover:bg-white/10 hover:text-white active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}