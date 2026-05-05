"use client";

import { useState } from "react";
import { Field, Grid, SectionCard, SectionTitle, ToggleRow } from "../ui";

export default function NotificationsTab() {
  const [appUpdates, setAppUpdates] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [messages, setMessages] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Signal Control</SectionTitle>

        <div className="space-y-3">
          <ToggleRow
            label="Application updates"
            description="Product changes and releases"
            enabled={appUpdates}
            onToggle={() => setAppUpdates((v) => !v)}
          />

          <ToggleRow
            label="System updates"
            description="Important account or platform notices"
            enabled={systemUpdates}
            onToggle={() => setSystemUpdates((v) => !v)}
          />

          <ToggleRow
            label="Messages"
            description="Conversation and support notifications"
            enabled={messages}
            onToggle={() => setMessages((v) => !v)}
          />

          <ToggleRow
            label="Marketing emails"
            description="Product tips and announcements"
            enabled={marketing}
            onToggle={() => setMarketing((v) => !v)}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Delivery summary</SectionTitle>

        <Grid>
          <Field label="In-app" value={messages ? "Enabled" : "Disabled"} />
          <Field label="Email" value={appUpdates || systemUpdates ? "Enabled" : "Disabled"} />
          <Field label="Promotional" value={marketing ? "Enabled" : "Disabled"} />
          <Field label="Critical alerts" value="Always enabled" />
        </Grid>
      </SectionCard>
    </div>
  );
}