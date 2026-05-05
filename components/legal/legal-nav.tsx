"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms-of-use", label: "Terms of Use" },
  { id: "trademarks", label: "Trademarks" },
];

export default function LegalNav() {
  const [active, setActive] = useState("privacy-policy");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;

        const offsetTop = el.offsetTop;
        const offsetHeight = el.offsetHeight;

        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActive(section.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-6 z-50 flex justify-center">
      <div className="flex items-center gap-2 px-2 py-2 rounded-full border border-white/10 bg-[#0B0F1A]/70 backdrop-blur-xl shadow-lg">

        {sections.map((section) => {
          const isActive = active === section.id;

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`
                px-4 py-1.5 rounded-full text-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-white text-black font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              {section.label}
            </a>
          );
        })}

      </div>
    </div>
  );
}