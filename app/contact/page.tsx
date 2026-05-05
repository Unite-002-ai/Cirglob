"use client";

import Link from "next/link";

const emails = [
  { label: "General", value: "contact@cirglob.com" },
  { label: "Founders", value: "founders@cirglob.com" },
  { label: "Investors", value: "investors@cirglob.com" },
  { label: "Press", value: "press@cirglob.com" },
  { label: "Partnerships", value: "partners@cirglob.com" },
];

const categories = [
  "Founders",
  "Investors",
  "Partnerships",
  "Press / Media",
  "General",
];

const socialLinks = [
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YouTubeIcon },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[220px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">

        {/* HERO */}
        <section className="text-center max-w-2xl mx-auto">
          <h1 className="text-[44px] md:text-[52px] font-semibold tracking-tight">
            Contact Cirglob
          </h1>

          <p className="mt-5 text-gray-400 text-[16px] leading-relaxed">
            We review all messages carefully. Please choose the right category below
            to ensure it reaches the right team.
          </p>
        </section>

        {/* CATEGORIES */}
        <section className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {categories.map((cat) => (
            <div
              key={cat}
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 hover:border-white/20 hover:bg-white/10 transition cursor-pointer"
            >
              {cat}
            </div>
          ))}
        </section>

        {/* FAQ PROMO */}
        <section className="mt-20 max-w-3xl mx-auto text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-6">
            <p className="text-gray-300 text-sm">
              Before contacting us, please check the{" "}
              <Link href="/faq" className="text-blue-400 hover:text-blue-300 transition">
                Frequently Asked Questions
              </Link>.
            </p>
          </div>
        </section>

        {/* 🔥 NEW SPLIT LAYOUT */}
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT: EMAILS */}
          <div>
            <h2 className="text-xl font-medium mb-6 text-gray-200">
              Direct Contact Channels
            </h2>

            <div className="grid gap-4">
              {emails.map((email) => (
                <div
                  key={email.value}
                  className="flex justify-between items-center px-6 py-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500/30 transition"
                >
                  <div>
                    <p className="text-sm text-gray-400">{email.label}</p>
                    <p className="text-white font-medium">{email.value}</p>
                  </div>

                  {/* CIRCULAR SEND BUTTON */}
                  <a
                    href={`mailto:${email.value}`}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-white/10 transition"
                  >
                    <SendIcon className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div>
            <h2 className="text-xl font-medium mb-6 text-center lg:text-left text-gray-200">
              Send a Message
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <select className="w-full px-4 py-3 rounded-lg bg-[#0B0D14] border border-white/10 text-white focus:outline-none focus:border-blue-500">
                <option>Founder</option>
                <option>Investor</option>
                <option>Partnership</option>
                <option>Press</option>
                <option>General</option>
              </select>

              <textarea
                rows={5}
                placeholder="Your message..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <button className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition">
                Send Message
              </button>
            </div>
          </div>

        </section>

        {/* SOCIAL LINKS */}
        <section className="mt-20 flex justify-center gap-6">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              className="text-gray-500 hover:text-white transition"
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="mt-28 border-t border-white/10 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Cirglob. All rights reserved.
        </footer>

      </div>
    </main>
  );
}

/* ---------------- ICONS ---------------- */

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 2L15 22l-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- social icons unchanged (keep yours) ---- */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M17.53 3H20.5L13.99 10.43L21.5 21H15.62L10.98 14.53L5.32 21H2.35L9.25 13.12L2.06 3H8.08L12.31 8.95L17.53 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.94 6.5A2.19 2.19 0 1 1 2.56 6.5a2.19 2.19 0 0 1 4.38 0ZM3 8.94h3.88V21H3V8.94Zm6.12 0H13v1.65h.05c.53-1 1.82-1.94 3.75-1.94 4 0 4.74 2.63 4.74 6.05V21h-3.88v-5.31c0-1.27-.02-2.9-1.76-2.9-1.76 0-2.03 1.37-2.03 2.8V21H9.12V8.94Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7.75 3h8.5A4.75 4.75 0 0 1 21 7.75v8.5A4.75 4.75 0 0 1 16.25 21h-8.5A4.75 4.75 0 0 1 3 16.25v-8.5A4.75 4.75 0 0 1 7.75 3Zm0 1.75A3 3 0 0 0 4.75 7.75v8.5a3 3 0 0 0 3 3h8.5a3 3 0 0 0 3-3v-8.5a3 3 0 0 0-3-3h-8.5Z"
        fill="currentColor"
      />
      <path
        d="M12 7.25A4.75 4.75 0 1 1 7.25 12 4.76 4.76 0 0 1 12 7.25Zm0 1.75A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z"
        fill="currentColor"
      />
      <circle cx="17.25" cy="6.75" r="1.05" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.7-1.6h1.2V4.8c-.6-.1-1.6-.2-2.8-.2-2.8 0-4.6 1.7-4.6 4.8V11H7v3h2.2v7h4.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M21.7 7.68a3 3 0 0 0-2.11-2.12C17.7 5 12 5 12 5s-5.7 0-7.59.56A3 3 0 0 0 2.3 7.68 31.5 31.5 0 0 0 2 12a31.5 31.5 0 0 0 .3 4.32 3 3 0 0 0 2.11 2.12C6.3 19 12 19 12 19s5.7 0 7.59-.56a3 3 0 0 0 2.11-2.12A31.5 31.5 0 0 0 22 12a31.5 31.5 0 0 0-.3-4.32ZM10 15.02V8.98L15.2 12 10 15.02Z"
        fill="currentColor"
      />
    </svg>
  );
}