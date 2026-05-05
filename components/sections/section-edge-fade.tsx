"use client";

export default function SectionEdgeFade() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#05060A] via-[#05060A]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05060A] via-[#05060A]/90 to-transparent" />
    </>
  );
}