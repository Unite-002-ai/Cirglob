// ===============================================
// FILE: app/faq/page.tsx
// ===============================================
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import FAQSidebar from "@/components/faq/faq-sidebar";
import FAQSearch from "@/components/faq/faq-search";
import FAQItem from "@/components/faq/faq-item";

type FAQ = {
  category: string;
  question: string;
  answer: string;
};

const categories = [
  "Getting Started",
  "Applications",
  "Investors",
  "Startups",
  "Launch Timeline",
  "General",
];

const faqData: FAQ[] = [
  {
    category: "Getting Started",
    question: "What is Cirglob?",
    answer:
      "Cirglob is a platform being built to connect serious founders solving real-world problems with investors, opportunities, and global growth systems.",
  },
  {
    category: "Getting Started",
    question: "Is Cirglob live yet?",
    answer:
      "Not yet. Cirglob is currently in development and preparing for its official public launch.",
  },
  {
    category: "Applications",
    question: "When do founder applications open?",
    answer:
      "Applications will open in official batches after launch announcements.",
  },
  {
    category: "Applications",
    question: "Can solo founders apply?",
    answer:
      "Yes. Solo founders may apply depending on future batch structure and requirements.",
  },
  {
    category: "Investors",
    question: "Can investors join early?",
    answer:
      "Yes. Investor interest registration may open before founder applications.",
  },
  {
    category: "Investors",
    question: "Is Cirglob only for Egypt?",
    answer:
      "No. Cirglob launches from Egypt with a global vision focused on emerging markets and international scale.",
  },
  {
    category: "Startups",
    question: "What sectors matter most?",
    answer:
      "AI, fintech, cybersecurity, logistics, healthcare, agriculture, education, infrastructure, climate, and other meaningful real-world sectors.",
  },
  {
    category: "Launch Timeline",
    question: "When is launch day?",
    answer:
      "Launch timing will be announced publicly once development milestones are completed.",
  },
  {
    category: "General",
    question: "How do I stay updated?",
    answer:
      "Join the waitlist and follow future official announcements as launch approaches.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchCategory = item.category === activeCategory;
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="relative min-h-screen bg-[#05060A] text-white flex overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[200px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block relative z-10 w-[290px] border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <FAQSidebar
          categories={categories}
          activeCategory={activeCategory}
          onChange={(cat) => {
            setActiveCategory(cat);
            setSearch("");
            setOpenIndex(null);
          }}
        />
      </aside>

      {/* MAIN */}
      <main className="relative z-10 flex-1 w-full px-6 md:px-14 py-10 md:py-16">
        {/* MOBILE TOP */}
        <div className="md:hidden mb-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white"
          >
            Cirglob
          </Link>
          <p className="text-sm text-gray-500 mt-1">Help & Support</p>
        </div>

        {/* HEADER */}
        <div className="max-w-4xl">
          <h1 className="text-[34px] md:text-[52px] leading-tight font-semibold tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl leading-relaxed">
            Find answers about Cirglob, founder applications, investors, and the
            upcoming platform launch.
          </p>
        </div>

        {/* MOBILE CATEGORY SELECTOR */}
        <div className="md:hidden mt-8">
          <select
            value={activeCategory}
            onChange={(e) => {
              setActiveCategory(e.target.value);
              setSearch("");
              setOpenIndex(null);
            }}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#05060A]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH */}
        <div className="mt-8 max-w-3xl">
          <FAQSearch value={search} onChange={setSearch} />
        </div>

        {/* FAQ LIST */}
        <div className="mt-12 max-w-4xl space-y-4">
          {filteredFAQs.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-400">
              No matching results found.
            </div>
          )}

          {filteredFAQs.map((item, index) => (
            <FAQItem
              key={`${item.question}-${index}`}
              item={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}