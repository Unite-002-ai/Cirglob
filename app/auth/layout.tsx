import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#05060A] text-white relative overflow-hidden">

      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,124,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(120,0,255,0.10),transparent_60%)]" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-500 z-10">
        © {new Date().getFullYear()} Cirglob. All rights reserved.
      </footer>
    </div>
  );
}