"use client";

import { useState } from "react";

export default function JobApplication() {
  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    linkedin: "",
    phone: "",
    countryCode: "+1",
    location: "",
    visa: "",
    motivation: "",
    resume: null,
  });

  const [errors, setErrors] = useState<any>({});
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔹 FULL COUNTRY LIST */
  const countries = [
    { code: "+93", label: "Afghanistan" },
    { code: "+355", label: "Albania" },
    { code: "+213", label: "Algeria" },
    { code: "+376", label: "Andorra" },
    { code: "+244", label: "Angola" },
    { code: "+54", label: "Argentina" },
    { code: "+374", label: "Armenia" },
    { code: "+61", label: "Australia" },
    { code: "+43", label: "Austria" },
    { code: "+994", label: "Azerbaijan" },
    { code: "+973", label: "Bahrain" },
    { code: "+880", label: "Bangladesh" },
    { code: "+32", label: "Belgium" },
    { code: "+55", label: "Brazil" },
    { code: "+359", label: "Bulgaria" },
    { code: "+1", label: "United States" },
    { code: "+56", label: "Chile" },
    { code: "+86", label: "China" },
    { code: "+57", label: "Colombia" },
    { code: "+385", label: "Croatia" },
    { code: "+420", label: "Czech Republic" },
    { code: "+45", label: "Denmark" },
    { code: "+20", label: "Egypt" },
    { code: "+372", label: "Estonia" },
    { code: "+358", label: "Finland" },
    { code: "+33", label: "France" },
    { code: "+49", label: "Germany" },
    { code: "+30", label: "Greece" },
    { code: "+852", label: "Hong Kong" },
    { code: "+36", label: "Hungary" },
    { code: "+91", label: "India" },
    { code: "+62", label: "Indonesia" },
    { code: "+353", label: "Ireland" },
    { code: "+972", label: "Israel" },
    { code: "+39", label: "Italy" },
    { code: "+81", label: "Japan" },
    { code: "+962", label: "Jordan" },
    { code: "+7", label: "Kazakhstan / Russia" },
    { code: "+82", label: "Korea" },
    { code: "+965", label: "Kuwait" },
    { code: "+371", label: "Latvia" },
    { code: "+961", label: "Lebanon" },
    { code: "+370", label: "Lithuania" },
    { code: "+352", label: "Luxembourg" },
    { code: "+60", label: "Malaysia" },
    { code: "+356", label: "Malta" },
    { code: "+52", label: "Mexico" },
    { code: "+31", label: "Netherlands" },
    { code: "+64", label: "New Zealand" },
    { code: "+47", label: "Norway" },
    { code: "+92", label: "Pakistan" },
    { code: "+63", label: "Philippines" },
    { code: "+48", label: "Poland" },
    { code: "+351", label: "Portugal" },
    { code: "+974", label: "Qatar" },
    { code: "+40", label: "Romania" },
    { code: "+966", label: "Saudi Arabia" },
    { code: "+65", label: "Singapore" },
    { code: "+421", label: "Slovakia" },
    { code: "+386", label: "Slovenia" },
    { code: "+27", label: "South Africa" },
    { code: "+34", label: "Spain" },
    { code: "+46", label: "Sweden" },
    { code: "+41", label: "Switzerland" },
    { code: "+886", label: "Taiwan" },
    { code: "+66", label: "Thailand" },
    { code: "+90", label: "Turkey" },
    { code: "+971", label: "UAE" },
    { code: "+44", label: "United Kingdom" },
    { code: "+84", label: "Vietnam" },
  ];

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, resume: "Invalid file type" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, resume: "File too large (max 5MB)" });
      return;
    }

    setFileName(file.name);
    setForm({ ...form, resume: file });
  };

  const validate = () => {
    let newErrors: any = {};

    if (!form.firstName) newErrors.firstName = "Required";
    if (!form.lastName) newErrors.lastName = "Required";

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Valid email required";

    if (!form.linkedin || !form.linkedin.includes("linkedin.com"))
      newErrors.linkedin = "Valid LinkedIn URL required";

    if (!form.location) newErrors.location = "Required";
    if (!form.visa) newErrors.visa = "Required";
    if (!form.resume) newErrors.resume = "Resume required";
    if (!form.motivation) newErrors.motivation = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1500));
      window.location.href = "/careers/thank-you";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="apply" className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          Application
        </h3>
        <p className="text-sm text-white/50 mt-1">
          Submit your application to join Cirglob.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <Grid>
          <Input name="firstName" placeholder="First Name *" {...{ form, errors, handleChange }} />
          <Input name="lastName" placeholder="Last Name *" {...{ form, errors, handleChange }} />
        </Grid>

        <Grid>
          <Input name="email" placeholder="Email Address *" {...{ form, errors, handleChange }} />
          <Input name="linkedin" placeholder="LinkedIn URL *" {...{ form, errors, handleChange }} />
        </Grid>

        <Grid>
          <div>
            <div className="flex gap-2">
              {/* COUNTRY DROPDOWN */}
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                size={1}
                className="
                  w-[140px] px-3 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-white text-sm
                  backdrop-blur-xl
                  focus:outline-none
                  focus:border-blue-400/40
                  appearance-none
                  overflow-y-auto
                "
                style={{
                  direction: "ltr",
                  scrollbarWidth: "none",
                }}
              >
                {countries.map((country) => (
                  <option
                    key={country.label}
                    value={country.code}
                    className="bg-[#111111] text-white"
                  >
                    {country.label} {country.code}
                  </option>
                ))}
              </select>

              {/* PHONE */}
              <input
                name="phone"
                placeholder="555 000 0000"
                onChange={handleChange}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-sm text-white placeholder:text-white/30
                  backdrop-blur-xl
                  focus:outline-none focus:border-blue-400/40
                "
              />
            </div>
          </div>

          <Input
            name="location"
            placeholder="Current Location *"
            {...{ form, errors, handleChange }}
          />
        </Grid>

        <Field label="US Work Authorization *" error={errors.visa}>
          <div className="flex gap-3">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setForm({ ...form, visa: option })}
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  form.visa === option
                    ? "bg-white text-black border-white"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Upload Resume *" error={errors.resume}>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <div className="input flex justify-between items-center">
              <span className="text-white/60">{fileName || "Choose file"}</span>
              <span className="text-xs text-white/40">
                PDF, DOC, DOCX (max 5MB)
              </span>
            </div>
          </div>
        </Field>

        <Field error={errors.motivation}>
          <textarea
            name="motivation"
            placeholder="Why Cirglob?"
            onChange={handleChange}
            className="input min-h-[140px]"
          />
        </Field>

        <p className="text-xs text-white/40">
          By applying, you acknowledge that your application may be evaluated
          using AI-assisted tools.{" "}
          <a href="/legal#applicant-data-policy" className="underline hover:text-white">
            Learn more
          </a>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            bg-white text-black font-medium
            hover:opacity-90 transition
            disabled:opacity-50
          "
        >
          {loading ? "Submitting..." : "Submit Application →"}
        </button>
      </form>
    </div>
  );
}

/* UI */

function Grid({ children }: any) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, error, children }: any) {
  return (
    <div>
      {label && <label className="text-sm text-white/60 mb-2 block">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}

function Input({ name, placeholder, form, errors, handleChange }: any) {
  return (
    <div>
      <input
        name={name}
        placeholder={placeholder}
        value={form[name] || ""}
        onChange={handleChange}
        className={`input ${errors[name] ? "border-red-500" : ""}`}
      />
      {errors[name] && (
        <p className="text-xs text-red-400 mt-1">{errors[name]}</p>
      )}
    </div>
  );
}