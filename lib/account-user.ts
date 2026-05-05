export type CirglobUser = {
  name: string;
  email?: string;
  image?: string | null;
  username?: string;
  bio?: string;
  location?: string;
  language?: string;
  timezone?: string;
};

const STORAGE_KEY = "cirglob_user";
const USER_UPDATED_EVENT = "cirglob:user-updated";

export const DEFAULT_USER: CirglobUser = {
  name: "John Doe",
  email: "john@cirglob.com",
  image: null,
  username: "@johndoe",
  bio: "",
  location: "",
  language: "English",
  timezone: "UTC",
};

export function getStoredUser(): CirglobUser {
  if (typeof window === "undefined") return DEFAULT_USER;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;

    const parsed = JSON.parse(raw) as Partial<CirglobUser>;
    return {
      ...DEFAULT_USER,
      ...parsed,
    };
  } catch {
    return DEFAULT_USER;
  }
}

export function setStoredUser(user: CirglobUser) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
}

export function onStoredUserChange(handler: () => void) {
  if (typeof window === "undefined") return () => {};

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) handler();
  };

  const customHandler = () => handler();

  window.addEventListener("storage", storageHandler);
  window.addEventListener(USER_UPDATED_EVENT, customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(USER_UPDATED_EVENT, customHandler);
  };
}