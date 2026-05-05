"use client";

import { ActionButton, Field, Grid, SectionCard, SectionTitle } from "../ui";

const applications = [
  {
    name: "Founder Application",
    status: "Draft",
    updated: "Today",
  },
  {
    name: "Team Expansion Form",
    status: "Not submitted",
    updated: "Yesterday",
  },
  {
    name: "Cirglob Identity Review",
    status: "No active update",
    updated: "Last week",
  },
];

export default function ApplicationsTab() {
  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Cirglob Activity</SectionTitle>

        <Grid className="md:grid-cols-3">
          <Field label="Drafts" value="1" />
          <Field label="Submitted" value="0" />
          <Field label="Status" value="No active applications" />
        </Grid>

        <div className="mt-6">
          <ActionButton type="button">Open application center</ActionButton>
        </div>
      </SectionCard>

      <div className="space-y-3">
        {applications.map((item) => (
          <SectionCard key={item.name}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-white/85">{item.name}</h3>
                <p className="text-xs text-white/35">Updated {item.updated}</p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/65">
                {item.status}
              </span>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}