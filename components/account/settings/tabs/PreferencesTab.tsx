"use client";

import { useState } from "react";
import { Field, Grid, Input, SectionCard, SectionTitle, Select, ToggleRow } from "../ui";

export default function PreferencesTab() {
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>User Environment</SectionTitle>

        <Grid>
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Language</span>
            <Select defaultValue="English">
              <option>English</option>
              <option>Arabic</option>
              <option>French</option>
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Timezone</span>
            <Select defaultValue="UTC">
              <option>UTC</option>
              <option>GMT</option>
              <option>EST</option>
              <option>PST</option>
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Interface density</span>
            <Input defaultValue="Standard" />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Default view</span>
            <Input defaultValue="Dashboard" />
          </label>
        </Grid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Behavior</SectionTitle>

        <div className="space-y-3">
          <ToggleRow
            label="Dark mode"
            description="Use the dark Cirglob system theme"
            enabled={darkMode}
            onToggle={() => setDarkMode((v) => !v)}
          />

          <ToggleRow
            label="Compact mode"
            description="Reduce spacing across the account system"
            enabled={compactMode}
            onToggle={() => setCompactMode((v) => !v)}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Theme" value={darkMode ? "Dark" : "Light"} />
          <Field label="Density" value={compactMode ? "Compact" : "Standard"} />
        </div>
      </SectionCard>
    </div>
  );
}