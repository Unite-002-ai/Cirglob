"use client";

import { useState } from "react";
import { Field, Grid, SectionCard, SectionTitle, ToggleRow } from "../ui";

export default function PrivacyTab() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [activityVisible, setActivityVisible] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Data Control</SectionTitle>

        <div className="space-y-3">
          <ToggleRow
            label="Profile visibility"
            description="Allow your profile to be discoverable"
            enabled={profileVisible}
            onToggle={() => setProfileVisible((v) => !v)}
          />

          <ToggleRow
            label="Data sharing"
            description="Share limited product usage data"
            enabled={dataSharing}
            onToggle={() => setDataSharing((v) => !v)}
          />

          <ToggleRow
            label="Activity visibility"
            description="Show your recent activity in Cirglob"
            enabled={activityVisible}
            onToggle={() => setActivityVisible((v) => !v)}
          />

          <ToggleRow
            label="Analytics"
            description="Allow anonymous usage analytics"
            enabled={analytics}
            onToggle={() => setAnalytics((v) => !v)}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Visibility summary</SectionTitle>

        <Grid>
          <Field label="Profile" value={profileVisible ? "Public" : "Private"} />
          <Field label="Sharing" value={dataSharing ? "Limited sharing" : "No sharing"} />
          <Field label="Activity" value={activityVisible ? "Visible" : "Hidden"} />
          <Field label="Analytics" value={analytics ? "Enabled" : "Disabled"} />
        </Grid>
      </SectionCard>
    </div>
  );
}