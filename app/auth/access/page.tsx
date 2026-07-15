import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AUTH_ROUTES, DEFAULT_AUTH_REDIRECT } from "@/lib/constants";
import { resolveSafeRedirect } from "@/lib/auth";

type AccessPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default async function AccessPage({
  searchParams,
}: AccessPageProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const safeNext = resolveSafeRedirect(
    searchParams?.next ?? null,
    DEFAULT_AUTH_REDIRECT,
  );

  if (user) {
    redirect(safeNext);
  }

  redirect(
    `${AUTH_ROUTES.SIGNIN}?next=${encodeURIComponent(safeNext)}`,
  );
}