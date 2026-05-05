"use client";

import { useEffect } from "react";

type UseAutoSaveProps = {
  data: unknown;
  delay?: number;
  onSave: (data: unknown) => Promise<void> | void;
};

export function useAutoSave({
  data,
  delay = 2000,
  onSave,
}: UseAutoSaveProps) {
  useEffect(() => {
    if (!data) return;

    const handler = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => clearTimeout(handler);
  }, [data, delay, onSave]);
}