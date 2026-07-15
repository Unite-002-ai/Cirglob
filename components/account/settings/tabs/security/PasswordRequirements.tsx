"use client";

type PasswordRequirementsProps = {
  password: string;
};

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const rules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Include uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Include number",
      valid: /\d/.test(password),
    },
  ];

  return (
    <div className="space-y-2">
      {/* HEADER */}
      <p className="text-xs text-white/40">
        Password requirements
      </p>

      {/* RULES */}
      <ul className="space-y-1">
        {rules.map((rule, idx) => (
          <li
            key={idx}
            className={`
              text-xs transition
              ${
                rule.valid
                  ? "text-white/70"
                  : "text-white/40"
              }
            `}
          >
            • {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
