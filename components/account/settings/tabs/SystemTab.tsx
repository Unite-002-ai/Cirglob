"use client";

import { useEffect, useState } from "react";
import { Field, Grid, SectionCard, SectionTitle } from "../ui";

export default function SystemTab() {
  const [device, setDevice] = useState("Detecting...");
  const [browser, setBrowser] = useState("Detecting...");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent;
    const platform = window.navigator.platform || "Unknown device";
    const browserName =
      ua.includes("Edg/")
        ? "Microsoft Edge"
        : ua.includes("Chrome/")
        ? "Chrome"
        : ua.includes("Safari/")
        ? "Safari"
        : "Unknown browser";

    setDevice(platform);
    setBrowser(browserName);
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Account Metadata</SectionTitle>

        <Grid>
          <Field label="Account created" value="Today" />
          <Field label="Last login" value="Just now" />
          <Field label="Device" value={device} />
          <Field label="Browser" value={browser} />
        </Grid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Read-only environment</SectionTitle>

        <Grid>
          <Field label="Session mode" value="Local demo state" />
          <Field label="Storage" value="localStorage user record" />
          <Field label="Routing" value="Query-based tabs" />
          <Field label="Layout" value="Sidebar + content shell" />
        </Grid>
      </SectionCard>
    </div>
  );
}