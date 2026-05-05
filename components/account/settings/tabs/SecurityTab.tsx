"use client";

import { useState } from "react";
import { ActionButton, Field, Grid, SectionCard, SectionTitle, ToggleRow } from "../ui";

export default function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [trustedDevices, setTrustedDevices] = useState(true);

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Trust Layer</SectionTitle>

        <Grid>
          <Field label="Password" value="••••••••" />
          <Field label="Active Sessions" value="1 device" />
          <Field label="Login Activity" value="View recent logins" />
          <Field label="Recovery Email" value="Configured" />
        </Grid>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton type="button">Change password</ActionButton>
          <ActionButton type="button">Review sessions</ActionButton>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Security Controls</SectionTitle>

        <div className="space-y-3">
          <ToggleRow
            label="Two-factor authentication"
            description="Require an extra code at sign-in"
            enabled={twoFactor}
            onToggle={() => setTwoFactor((v) => !v)}
          />

          <ToggleRow
            label="Login alerts"
            description="Get notified when a new device signs in"
            enabled={loginAlerts}
            onToggle={() => setLoginAlerts((v) => !v)}
          />

          <ToggleRow
            label="Trusted devices"
            description="Remember devices you use often"
            enabled={trustedDevices}
            onToggle={() => setTrustedDevices((v) => !v)}
          />
        </div>
      </SectionCard>
    </div>
  );
}