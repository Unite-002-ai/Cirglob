'use client';

import React from 'react';

import ProfileSectionHeader from '../ui/ProfileSectionHeader';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import LocationAutocomplete from '../ui/LocationAutocomplete';

import type { IdentityData } from '../founder-profile-types';

interface IdentityProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
  errors?: Partial<Record<keyof IdentityData, string>>;
}

export default function Identity({ data, onChange, errors = {} }: IdentityProps) {
  const updateField = <K extends keyof IdentityData>(
    key: K,
    value: IdentityData[K]
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="Identity"
        description="Core founder identity and contact information."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Full name"
          value={data.fullName}
          onChange={(v) => updateField('fullName', v)}
          error={errors.fullName}
          placeholder="Your full legal name"
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(v) => updateField('email', v)}
          error={errors.email}
          placeholder="you@company.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="What is your role in the company?"
          value={data.roleInCompany}
          onChange={(v) => updateField('roleInCompany', v)}
          error={errors.roleInCompany}
          placeholder="CEO, CTO, Product, Engineering, Operations..."
          required
        />

        <PhoneInput
          label="Phone number"
          countryCode={data.phoneCountryCode}
          phoneNumber={data.phoneNumber}
          onCountryCodeChange={(v) => updateField('phoneCountryCode', v)}
          onPhoneNumberChange={(v) => updateField('phoneNumber', v)}
          error={errors.phoneNumber || errors.phoneCountryCode}
          hint="Choose the country code, then enter the rest of the number."
        />
      </div>

      <LocationAutocomplete
        label="City where you currently live"
        value={data.currentLocation}
        onChange={(v) => updateField('currentLocation', v)}
        error={errors.currentLocation}
        placeholder="Search a city, state, or country..."
        required
      />
    </div>
  );
}
