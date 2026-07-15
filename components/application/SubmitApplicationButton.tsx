// FILE: components/application/SubmitApplicationButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

type ValidationState = {
  valid: boolean;
  missing: string[];
};

export default function SubmitApplicationButton() {
  const router = useRouter();

  const validation: ValidationState = useMemo(() => {
    return {
      valid: true,
      missing: [],
    };
  }, []);

  const handleSubmit = () => {
    router.push("/apply/success");
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div aria-hidden="true" className="min-h-[1px] flex-1" />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!validation.valid}
          className="
            ml-auto
            inline-flex items-center justify-center
            rounded-full px-5 py-2.5 text-sm font-medium text-white
            border border-white/10 bg-white/5
            hover:bg-white/10 transition
            whitespace-nowrap
            disabled:cursor-not-allowed
            disabled:opacity-40
            disabled:hover:bg-white/5
            disabled:hover:scale-100
          "
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}