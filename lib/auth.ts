import "server-only";

import type { Session, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import {
  AUTH as AUTH_CONFIG,
  PUBLIC_AUTH_ROUTES,
  PROTECTED_ROUTES,
  ROUTES,
} from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * =========================================================
 * CIRGLOB AUTH LAYER
 * =========================================================
 *
 * PURPOSE
 * -------
 * Centralized application authentication layer.
 *
 * This file is intentionally:
 * - framework-aware
 * - Supabase-backed
 * - SSR-safe
 * - RLS-safe
 * - proxy-compatible
 * - future-extensible
 *
 * RESPONSIBILITIES
 * ----------------
 * - session retrieval
 * - authenticated user retrieval
 * - protected route guards
 * - redirect helpers
 * - centralized auth flow
 * - auth-safe navigation
 *
 * THIS FILE SHOULD NOT:
 * ---------------------
 * - query business systems
 * - contain founder logic
 * - contain investor logic
 * - contain onboarding logic
 * - contain profile mutation logic
 *
 * Identity/profile shaping belongs in:
 * /lib/account-user.ts
 *
 * Supabase infrastructure belongs in:
 * /lib/supabase/*
 */

export const AUTH_ROUTES = {
  signin: ROUTES.AUTH.SIGNIN,
  signup: ROUTES.AUTH.SIGNUP,
  forgotPassword: ROUTES.AUTH.FORGOT_PASSWORD,
  resetPassword: ROUTES.AUTH.RESET_PASSWORD,
  callback: ROUTES.AUTH.CALLBACK,
  access: ROUTES.AUTH.ACCESS,
} as const;

export const APP_ROUTES = {
  home: ROUTES.HOME,
  apply: ROUTES.APPLY,
  dashboard: ROUTES.APPLY_DASHBOARD,
  account: ROUTES.ACCOUNT,
} as const;

export const PUBLIC_ROUTES = [
  APP_ROUTES.home,
  APP_ROUTES.apply,
  ...PUBLIC_AUTH_ROUTES,
] as const;

export const PROTECTED_APP_ROUTES = PROTECTED_ROUTES;

export interface AuthState {
  user: User | null;
  session: Session | null;
  authenticated: boolean;
}

export interface RedirectAuthenticatedOptions {
  redirectTo?: string;
}

export interface RedirectUnauthenticatedOptions {
  next?: string;
  signinPath?: string;
}

async function getSupabase() {
  return createServerSupabaseClient();
}

function createUnauthenticatedError(): Error {
  return new Error("UNAUTHENTICATED");
}

function normalizePathname(pathname: string): string {
  const value = pathname.trim();

  if (!value) return "/";

  return value.startsWith("/") ? value : `/${value}`;
}

function pathMatchesRoute(pathname: string, route: string): boolean {
  const path = normalizePathname(pathname).replace(/\/+$/, "") || "/";
  const target = normalizePathname(route).replace(/\/+$/, "") || "/";

  if (target === "/") {
    return path === "/";
  }

  return path === target || path.startsWith(`${target}/`);
}

function buildNextParam(path?: string | null): string {
  const safePath = resolveSafeRedirect(path, "");

  if (!safePath) return "";

  return `?${AUTH_CONFIG.NEXT_QUERY_PARAM}=${encodeURIComponent(safePath)}`;
}

/**
 * SSR-safe session retrieval.
 *
 * Uses authenticated cookies through the server Supabase client.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await getSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return session;
}

/**
 * SSR-safe authenticated user retrieval.
 *
 * IMPORTANT:
 * Uses getUser() instead of trusting session payloads.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

/**
 * Optional authenticated user retrieval.
 */
export async function getOptionalUser(): Promise<User | null> {
  return getUser();
}

/**
 * Unified auth state helper.
 */
export async function getAuthState(): Promise<AuthState> {
  const supabase = await getSupabase();

  const [{ data: sessionData, error: sessionError }, { data: userData, error: userError }] =
    await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);

  return {
    session: sessionError ? null : sessionData.session,
    user: userError ? null : userData.user,
    authenticated: !!userData.user,
  };
}

/**
 * Requires authenticated user.
 *
 * Throws instead of redirecting.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    throw createUnauthenticatedError();
  }

  return user;
}

/**
 * Alias kept for semantic clarity.
 */
export async function requireAuthenticatedUser(): Promise<User> {
  return requireUser();
}

/**
 * Requires authenticated session.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw createUnauthenticatedError();
  }

  return session;
}

/**
 * SSR redirect guard.
 */
export async function requireAuthenticatedPage(next?: string): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect(`${AUTH_ROUTES.signin}${buildNextParam(next ?? APP_ROUTES.dashboard)}`);
  }

  return user;
}

/**
 * Redirect signed-in users away from auth pages.
 */
export async function redirectIfAuthenticated(
  options: RedirectAuthenticatedOptions = {},
): Promise<void> {
  const { redirectTo = APP_ROUTES.dashboard } = options;
  const user = await getUser();

  if (user) {
    redirect(resolveSafeRedirect(redirectTo, APP_ROUTES.dashboard));
  }
}

/**
 * Redirect unauthenticated users.
 */
export async function redirectIfUnauthenticated(
  options: RedirectUnauthenticatedOptions = {},
): Promise<User> {
  const {
    next = APP_ROUTES.dashboard,
    signinPath = AUTH_ROUTES.signin,
  } = options;

  const user = await getUser();

  if (!user) {
    const safeNext = resolveSafeRedirect(next, APP_ROUTES.dashboard);
    redirect(`${signinPath}${buildNextParam(safeNext)}`);
  }

  return user;
}

/**
 * Centralized auth access gate.
 */
export async function resolveAccessRoute(next?: string | null): Promise<never> {
  const destination = resolveSafeRedirect(next, APP_ROUTES.dashboard);
  const user = await getUser();

  if (user) {
    redirect(destination);
  }

  redirect(`${AUTH_ROUTES.signin}${buildNextParam(destination)}`);
}

/**
 * Prevent unsafe redirects.
 */
export function resolveSafeRedirect(
  next?: string | null,
  fallback: string = APP_ROUTES.dashboard,
): string {
  if (!next) return fallback;

  const trimmed = next.trim();

  if (!trimmed) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;

  try {
    const url = new URL(trimmed, "http://cirglob.local");

    if (url.origin !== "http://cirglob.local") {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_APP_ROUTES.some((route) => pathMatchesRoute(pathname, route));
}

export function isPublicRoute(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);

  if (PUBLIC_ROUTES.includes(normalizedPath as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }

  return pathMatchesRoute(normalizedPath, ROUTES.AUTH.ROOT);
}

export function isAuthRoute(pathname: string): boolean {
  return pathMatchesRoute(pathname, ROUTES.AUTH.ROOT);
}

/**
 * Server-side sign out.
 */
export async function signOut(): Promise<void> {
  const supabase = await getSupabase();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function isUnauthenticatedError(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHENTICATED";
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown authentication error.";
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHENTICATED":
        return "You must be signed in.";
      case "INVALID_LOGIN_CREDENTIALS":
        return "Invalid email or password.";
      case "EMAIL_NOT_CONFIRMED":
        return "Please verify your email address.";
      case "SESSION_EXPIRED":
        return "Your session has expired.";
      case "ACCESS_DENIED":
        return "Access denied.";
      default:
        return error.message;
    }
  }

  return "Unexpected authentication error.";
}

export const auth = {
  getSession,
  getUser,
  getOptionalUser,
  getAuthState,
  requireUser,
  requireAuthenticatedUser,
  requireSession,
  requireAuthenticatedPage,
  redirectIfAuthenticated,
  redirectIfUnauthenticated,
  resolveAccessRoute,
  resolveSafeRedirect,
  isProtectedRoute,
  isPublicRoute,
  isAuthRoute,
  signOut,
} as const;