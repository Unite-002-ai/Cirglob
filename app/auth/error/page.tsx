import Link from "next/link";

import CirglobBrand from "@/components/CirglobBrand";
import {
  AUTH_SIGNIN_ROUTE,
  AUTH_SIGNUP_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
} from "@/lib/constants";

type AuthErrorPageProps = {
  searchParams?: {
    reason?: string;
    error?: string;
  };
};

/**
 * =========================================================
 * CIRGLOB AUTH ERROR BOUNDARY
 * =========================================================
 *
 * Purpose:
 * Centralized authentication/system error surface.
 *
 * This page handles:
 * - invalid auth callbacks
 * - expired verification links
 * - missing sessions
 * - OAuth failures
 * - corrupted auth states
 * - profile synchronization issues
 */

const ERROR_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
    primaryAction: {
      href: string;
      label: string;
    };
  }
> = {
  profile_missing: {
    title: "Account setup incomplete",
    description:
      "Your authentication session was created successfully, but your account profile could not be initialized correctly. This is usually temporary.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Try signing in again",
    },
  },

  auth_exchange_failed: {
    title: "Authentication failed",
    description:
      "We could not complete the secure authentication exchange. Your session may have expired or the verification link may no longer be valid.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Return to sign in",
    },
  },

  missing_authenticated_user: {
    title: "Session validation failed",
    description:
      "Your authentication session could not be validated securely. Please sign in again to continue.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Sign in again",
    },
  },

  no_session: {
    title: "No active session",
    description:
      "Your session is no longer active or could not be restored securely.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Continue to sign in",
    },
  },

  unexpected: {
    title: "Unexpected authentication error",
    description:
      "An unexpected authentication error occurred while processing your request.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Retry authentication",
    },
  },

  invalid_link: {
    title: "Invalid or expired link",
    description:
      "This authentication or recovery link is no longer valid. Request a new one and try again.",
    primaryAction: {
      href: AUTH_SIGNIN_ROUTE,
      label: "Request a new sign in link",
    },
  },
};

function getErrorContent(reason?: string, error?: string) {
  const key = reason || error || "unexpected";
  return ERROR_CONTENT[key] || ERROR_CONTENT.unexpected;
}

export default function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const reason = searchParams?.reason;
  const error = searchParams?.error;

  const content = getErrorContent(reason, error);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#05060A] px-6 text-white">
      <div className="absolute left-6 top-6 z-20">
        <CirglobBrand />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[800px] w-[800px] rounded-full bg-blue-500/10 blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="absolute -inset-1 rounded-2xl bg-red-500/5 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium tracking-wide text-red-300">
              Authentication Error
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">
              {content.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={content.primaryAction.href}
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
              >
                {content.primaryAction.label}
              </Link>

              <Link
                href={AUTH_SIGNUP_ROUTE}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs leading-6 text-gray-500">
                If this issue continues, try restarting the authentication flow
                from the beginning or returning to your account dashboard.
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs">
                <Link
                  href={DEFAULT_AUTHENTICATED_ROUTE}
                  className="text-gray-400 transition hover:text-white"
                >
                  Account
                </Link>

                <Link
                  href="/apply"
                  className="text-gray-400 transition hover:text-white"
                >
                  Apply
                </Link>

                <Link
                  href="/"
                  className="text-gray-400 transition hover:text-white"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}