"use client";

import React from "react";
import { useRouter } from "next/navigation";

type ApplicationContentProps = {
  children: React.ReactNode;
};

export default function ApplicationContent({
  children,
}: ApplicationContentProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl">
      <div className="flex w-full max-w-4xl items-start gap-4">
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight text-white md:text-[52px]">
          Cirglob Application
        </h1>

        <button
          type="button"
          onClick={() => router.push("/apply/dashboard")}
          aria-label="Back to dashboard"
          className="
            ml-auto mt-2 inline-flex shrink-0 items-center justify-center
            rounded-full border border-white/10 bg-white/5 px-4 py-2.5
            text-sm font-medium text-white/80 transition
            hover:bg-white/10 hover:text-white
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-0
            md:mt-4
          "
        >
          ← Back
        </button>
      </div>

      <div className="mt-12 space-y-12">{children}</div>
    </div>
  );
}