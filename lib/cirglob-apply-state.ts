export const STORAGE_KEYS = {
  draft: "cirglob-application-draft",
  progress: "cirglob-application-progress",
  lastSaved: "cirglob-application-last-saved",
};

export function saveApplyState(state: any) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(state));
  localStorage.setItem(STORAGE_KEYS.lastSaved, Date.now().toString());
}

export function loadApplyState() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEYS.draft);
  return raw ? JSON.parse(raw) : null;
}

export function saveProgress(progress: number) {
  localStorage.setItem(STORAGE_KEYS.progress, String(progress));
}

export function loadProgress() {
  if (typeof window === "undefined") return 0;

  return Number(localStorage.getItem(STORAGE_KEYS.progress) || 0);
}