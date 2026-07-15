import Link from "next/link";

import { CirglobLogo } from "@/components/CirglobBrand";
import DashboardIdentity from "@/components/dashboard/DashboardIdentity";

export type ApplicationItem = {
  title: string;
  status: string;
  statusTone: "neutral" | "warning" | "brand";
  actionLabel: string;
  href: string;
  secondaryLabel?: string;
  secondaryActionLabel?: string;
  secondaryHref?: string;
  actionDisabled?: boolean;
};

type InitialUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type DashboardLandingProps = {
  initialUser: InitialUser;
  founderProfileTile: ApplicationItem;
  applicationTile: ApplicationItem;
  cycleLabel: string;
  workspaceLoadFailed: boolean;
};

function statusToneClasses(tone: ApplicationItem["statusTone"]): string {
  switch (tone) {
    case "warning":
      return "bg-amber-500/10 border-amber-500/20 text-amber-300";
    case "brand":
      return "bg-blue-500/10 border-blue-500/20 text-blue-300";
    default:
      return "bg-white/5 border-white/10 text-white/60";
  }
}

function ApplicationTile({
  title,
  status,
  statusTone,
  actionLabel,
  href,
  secondaryLabel,
  secondaryActionLabel,
  secondaryHref,
  actionDisabled,
}: ApplicationItem) {
  const primaryButtonClass = [
    "inline-flex items-center justify-center",
    "rounded-full px-5 py-2.5 text-sm font-medium text-white",
    "bg-gradient-to-r from-blue-500 to-purple-600",
    "hover:scale-[1.02] transition",
    "whitespace-nowrap",
  ].join(" ");

  const secondaryButtonClass = [
    "inline-flex items-center justify-center",
    "rounded-full px-5 py-2.5 text-sm font-medium text-white",
    "border border-white/10 bg-white/5",
    "hover:bg-white/10 transition",
    "whitespace-nowrap",
  ].join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-medium text-white">{title}</h3>

            <span
              className={[
                "shrink-0 rounded-full border px-3 py-1 text-[11px] leading-none",
                statusToneClasses(statusTone),
              ].join(" ")}
            >
              {status}
            </span>
          </div>

          {secondaryLabel ? (
            <p className="mt-4 text-xs leading-relaxed text-white/45">
              {secondaryLabel}
            </p>
          ) : null}
        </div>

        <div className="shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {secondaryActionLabel && secondaryHref ? (
              <Link href={secondaryHref} className={secondaryButtonClass}>
                {secondaryActionLabel}
              </Link>
            ) : null}

            {actionDisabled ? (
              <span
                className={[
                  primaryButtonClass,
                  "cursor-default opacity-70 hover:scale-100",
                ].join(" ")}
              >
                {actionLabel}
              </span>
            ) : (
              <Link href={href} className={primaryButtonClass}>
                {actionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLanding({
  initialUser,
  founderProfileTile,
  applicationTile,
  cycleLabel,
  workspaceLoadFailed,
}: DashboardLandingProps) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#070b14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_30%)]" />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CirglobLogo />

            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Cirglob Application
            </p>
          </div>

          <DashboardIdentity initialUser={initialUser} />
        </div>

        <div className="mt-8 grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden xl:grid-cols-12">
          <div className="col-span-1 flex min-h-0 flex-col gap-6 overflow-hidden xl:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-medium">Applications</h2>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {cycleLabel}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <ApplicationTile {...founderProfileTile} />
                <ApplicationTile {...applicationTile} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 overflow-hidden md:grid-cols-3">
              {[
                {
                  title: "Review",
                  text: "Applications are reviewed on a rolling basis through a structured evaluation process.",
                },
                {
                  title: "Focus",
                  text: "Execution, product clarity, and long-term judgment under real-world constraints.",
                },
                {
                  title: "Support",
                  text: "Long-term access to strategic networks, operational guidance, and ecosystem infrastructure designed to support durable company building.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>

                  <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 flex min-h-0 flex-col gap-6 overflow-hidden xl:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <p className="text-xs uppercase text-white/50">Deadline</p>

              <p className="mt-2 text-xl font-semibold text-white">
                May 4 · 8:00 PM PT
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Priority consideration period
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="text-sm font-medium text-white">Help</h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                <Link href="/faq" className="transition hover:text-white">
                  FAQ
                </Link>

                <Link href="/contact" className="transition hover:text-white">
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <p className="text-sm text-white">System Status</p>

              <p className="mt-2 text-sm text-gray-400">
                {workspaceLoadFailed
                  ? "Secure workspace snapshot could not be loaded."
                  : "Secure workspace snapshot in use. Continue anytime."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}