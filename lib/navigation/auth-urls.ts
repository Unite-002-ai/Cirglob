
import { AUTH, ROUTES } from "../constants";

type SearchParamsInput = string | URLSearchParams | null | undefined;

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isAuthRoute(pathname: string): boolean {
  return pathname === ROUTES.AUTH.ROOT || pathname.startsWith(`${ROUTES.AUTH.ROOT}/`);
}

function normalizeRelativePath(pathname: string | null | undefined): string {
  const candidate = safeString(pathname);

  if (!candidate) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (!candidate.startsWith("/")) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (candidate.startsWith("//")) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (candidate.includes("\\") || candidate.includes("\0")) {
    return AUTH.DEFAULT_AUTH_REDIRECT;
  }
  if (isAuthRoute(candidate)) return AUTH.DEFAULT_AUTH_REDIRECT;

  return candidate;
}

function normalizeSearchParams(searchParamsOrString: SearchParamsInput): string {
  if (!searchParamsOrString) return "";

  if (typeof searchParamsOrString === "string") {
    const trimmed = searchParamsOrString.trim();
    if (!trimmed) return "";

    const raw = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
    if (!raw) return "";

    return new URLSearchParams(raw).toString();
  }

  return new URLSearchParams(searchParamsOrString).toString();
}

function normalizeNextValue(next: string | null | undefined): string {
  const candidate = safeString(next);

  if (!candidate) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (!candidate.startsWith("/")) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (candidate.startsWith("//")) return AUTH.DEFAULT_AUTH_REDIRECT;
  if (candidate.includes("\\") || candidate.includes("\0")) {
    return AUTH.DEFAULT_AUTH_REDIRECT;
  }
  if (isAuthRoute(candidate)) return AUTH.DEFAULT_AUTH_REDIRECT;

  return candidate;
}

export function buildAuthNextFromLocation(
  pathname: string | null | undefined,
  searchParamsOrString: SearchParamsInput,
): string {
  const safePath = normalizeRelativePath(pathname);
  const search = normalizeSearchParams(searchParamsOrString);

  return search ? `${safePath}?${search}` : safePath;
}

export function buildSigninHref(next: string | null | undefined): string {
  const params = new URLSearchParams();
  params.set(AUTH.NEXT_QUERY_PARAM, normalizeNextValue(next));

  return `${ROUTES.AUTH.SIGNIN}?${params.toString()}`;
}