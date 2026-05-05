import Link from "next/link";
import CirglobBrand from "./CirglobBrand";

const companyLinks = [
  { label: "Cirglob Blog", href: "/Cirglob-blog" },
  { label: "Contact", href: "/contact" },
  { label: "Vision", href: "/vision" },
  { label: "Ecosystem", href: "/Ecosystem" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/legal#privacy-policy" },
  { label: "Terms of Use", href: "/legal#terms-of-use" },
];

const resourceLinks = [
  {
    label: "FAQ",
    href: "/faq",
  },
  { label: "Partners", href: "/partners" },
  { label: "Demo Day", href: "/demo-day" },
  { label: "Interview Guide", href: "/interview-guide" },
  { label: "Startup Resources", href: "/startup-resources" },
];

const programLinks = [
  { label: "Apply", href: "/apply" },
  { label: "Work at Startups", href: "/work-at-startups" }, 
  { label: "Find a Co-Founder", href: "/Find-a-Co-Founder" },
  { label: "Hackathon", href: "/Hackathon" },
];

const investorLinks = [
  { label: "Investor Network", href: "/investors" },
  { label: "Investor Resources", href: "/investor-resources" },
  { label: "Cirglob Syndicate", href: "/cirglob-syndicate" },
];

const socialLinks = [
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YouTubeIcon },
];

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

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.8]">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`group relative text-sm transition duration-200 ${
                item.href === "/faq"
                  ? "text-white font-medium"
                  : "text-white/[0.58] hover:text-white"
              }`}
            >

              {item.label}

              {/* subtle premium glow for FAQ */}
              {item.href === "/faq" && (
                <span className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/60 to-purple-500/60 opacity-70 group-hover:opacity-100 transition" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CirglobBottomBar() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,rgba(16,22,43,0.36),rgba(9,11,20,0.92))] backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.14),transparent_60%)]" />
      <div className="absolute -right-24 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(77,124,255,0.14),transparent_72%)] blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08),transparent_72%)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <CirglobBrand />

              <p className="mt-4 max-w-md text-sm leading-6 text-white/[0.56]">
                A global startup platform built to discover, support, and scale
                founders solving real-world problems.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
              <FooterColumn title="Company" items={companyLinks} />
              <FooterColumn title="Resources" items={resourceLinks} />
              <FooterColumn title="Programs" items={programLinks} />
              <FooterColumn title="Investors" items={investorLinks} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/[0.42]">
              © {new Date().getFullYear()} Cirglob. All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/[0.68] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
                  >
                    <Icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 