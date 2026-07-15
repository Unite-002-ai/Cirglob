"use client";

import React from "react";

export type ApplicationAlertLevel = "info" | "warning" | "error" | "success";

export type ApplicationAlert = {
  id: string;
  level: ApplicationAlertLevel;
  title: string;
  message: string;
  sectionId?: string | null;
  source?: string | null;
  actionLabel?: string | null;
  onAction?: () => void;
};

type ApplicationAlertsProps = {
  alerts: ApplicationAlert[];
  className?: string;
};

const LEVEL_STYLES: Record<
  ApplicationAlertLevel,
  {
    border: string;
    background: string;
    title: string;
    text: string;
    badge: string;
  }
> = {
  info: {
    border: "border-sky-400/20",
    background: "bg-sky-500/10",
    title: "text-sky-50",
    text: "text-sky-100/75",
    badge: "bg-sky-400/15 text-sky-100",
  },
  warning: {
    border: "border-amber-400/20",
    background: "bg-amber-500/10",
    title: "text-amber-50",
    text: "text-amber-100/75",
    badge: "bg-amber-400/15 text-amber-100",
  },
  error: {
    border: "border-rose-400/20",
    background: "bg-rose-500/10",
    title: "text-rose-50",
    text: "text-rose-100/75",
    badge: "bg-rose-400/15 text-rose-100",
  },
  success: {
    border: "border-emerald-400/20",
    background: "bg-emerald-500/10",
    title: "text-emerald-50",
    text: "text-emerald-100/75",
    badge: "bg-emerald-400/15 text-emerald-100",
  },
};

export default function ApplicationAlerts({
  alerts,
  className = "",
}: ApplicationAlertsProps): React.JSX.Element | null {
  if (!alerts.length) return null;

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {alerts.map((alert) => {
        const styles = LEVEL_STYLES[alert.level];

        return (
          <div
            key={alert.id}
            role="status"
            className={`rounded-2xl border ${styles.border} ${styles.background} px-4 py-4 shadow-sm`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${styles.badge}`}>
                    {alert.level}
                  </span>
                  {alert.sectionId ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/50">
                      {alert.sectionId}
                    </span>
                  ) : null}
                  {alert.source && alert.source !== alert.sectionId ? (
                    <span className="text-[11px] font-medium tracking-wide text-white/30">
                      {alert.source}
                    </span>
                  ) : null}
                </div>

                <div className={`text-sm font-semibold ${styles.title}`}>
                  {alert.title}
                </div>
                <p className={`text-sm leading-6 ${styles.text}`}>
                  {alert.message}
                </p>
              </div>

              {alert.actionLabel && alert.onAction ? (
                <button
                  type="button"
                  onClick={alert.onAction}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {alert.actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}