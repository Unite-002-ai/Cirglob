import "server-only";

/**
 * =========================================================
 * CIRGLOB — APPLICATION INVITATION EMAIL
 * =========================================================
 *
 * PURPOSE
 * -------
 * Server-only email sender for cofounder invitations.
 *
 * TRANSPORT
 * ---------
 * Uses the Resend REST API via fetch. No additional package
 * is required. Configure with:
 *
 *   RESEND_API_KEY          — required
 *   EMAIL_FROM_ADDRESS      — required (e.g. invites@cirglob.com)
 *   NEXT_PUBLIC_SITE_URL    — required (e.g. https://cirglob.com)
 *
 * NON-RESPONSIBILITIES
 * --------------------
 * - Token generation (handled in invitation-token.server.ts)
 * - Database writes (handled in application-invitations.server.ts)
 * - Auth/session logic
 * =========================================================
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const INVITATION_EMAIL_TIMEOUT_MS = 10_000;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Cirglob Email] Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export type InvitationEmailConfig = {
  fromAddress: string;
  resendApiKey: string;
};

function normalizeSiteUrl(value?: string | null): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

function isPlausibleHttpUrl(value: string): boolean {
  return /^https?:\/\/[^/]+$/i.test(value);
}

export function resolveInvitationEmailConfig( 
  siteUrlOverride?: string | null,
): InvitationEmailConfig {
  const requestSiteUrl = normalizeSiteUrl(siteUrlOverride);
  const envSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  const siteUrl = requestSiteUrl || envSiteUrl;

  if (!siteUrl || !isPlausibleHttpUrl(siteUrl)) {
    throw new Error(
      "[Cirglob Email] Missing or invalid site URL. Set NEXT_PUBLIC_SITE_URL or ensure the request origin is valid.",
    );
  }

  return {
    fromAddress: requireEnv(
      process.env.EMAIL_FROM_ADDRESS?.trim(),
      "EMAIL_FROM_ADDRESS",
    ),
    resendApiKey: requireEnv(
      process.env.RESEND_API_KEY?.trim(),
      "RESEND_API_KEY",
    ),
  };
}

function formatExpiry(expiresAt: Date): string {
  return expiresAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildEmailHtml(input: {
  inviterName: string | null;
  applicationName: string | null;
  acceptUrl: string;
  expiresAt: Date;
}): string {
  const inviterLabel = input.inviterName
    ? `<strong>${escapeHtml(input.inviterName)}</strong> has invited you`
    : "You have been invited";

  const applicationLabel = input.applicationName
    ? ` to the <strong>${escapeHtml(input.applicationName)}</strong> application`
    : "";

  const expiryLabel = formatExpiry(input.expiresAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cofounder Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f9f9f7;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;background:#ffffff;border-radius:8px;
                      border:1px solid #e5e5e0;padding:40px 40px 32px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;
                        letter-spacing:0.08em;color:#888;text-transform:uppercase;">
                Cirglob
              </p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;
                         color:#111;line-height:1.3;">
                You've been invited to co-found
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
                ${inviterLabel}${applicationLabel} as a co-founder on Cirglob.
                Use the button below to sign in and accept the invitation.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="margin-bottom:24px;">
                <tr>
                  <td align="left">
                    <a href="${escapeHtml(input.acceptUrl)}"
                       style="display:inline-block;padding:12px 28px;
                              background:#111;color:#fff;font-size:14px;
                              font-weight:600;text-decoration:none;
                              border-radius:6px;letter-spacing:0.02em;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.5;">
                This invitation expires on <strong>${expiryLabel}</strong>.
                If you were not expecting this, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #e5e5e0;margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">
                If the button does not work, copy this link into your browser:<br />
                <span style="color:#555;word-break:break-all;">${escapeHtml(input.acceptUrl)}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type SendApplicationInvitationEmailInput = {
  recipientEmail: string;
  inviterName: string | null;
  applicationName: string | null;
  acceptUrl: string;
  expiresAt: Date;
};

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("[Cirglob Email] Resend API request timed out.");
    }

    throw new Error(
      `[Cirglob Email] Resend API request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Sends a cofounder invitation email via the Resend API.
 *
 * Throws if the email could not be sent. Callers should catch
 * and decide whether to surface the error or continue.
 */
export async function sendApplicationInvitationEmail(
  input: SendApplicationInvitationEmailInput,
): Promise<void> {
  const config = resolveInvitationEmailConfig();
  const acceptUrl = input.acceptUrl.trim();

  if (!acceptUrl) {
    throw new Error("[Cirglob Email] Missing invitation accept URL.");
  }

  const html = buildEmailHtml({
    inviterName: input.inviterName,
    applicationName: input.applicationName,
    acceptUrl,
    expiresAt: input.expiresAt,
  });

  let response: Response;

  try {
    response = await fetchWithTimeout(
      RESEND_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.fromAddress,
          to: [input.recipientEmail],
          subject: "You've been invited to co-found on Cirglob",
          html,
        }),
      },
      INVITATION_EMAIL_TIMEOUT_MS,
    );
  } catch (error) {
    throw new Error(
      `[Cirglob Email] Failed to send invitation email: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");
    throw new Error(
      `[Cirglob Email] Resend API returned ${response.status}: ${body}`,
    );
  }
}