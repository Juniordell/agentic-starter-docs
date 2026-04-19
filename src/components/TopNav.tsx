"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm z-50 flex items-center px-6 gap-4 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <Logo size={24} />
        <span className="font-semibold text-sm text-[var(--text)]">Agentic Starter</span>
      </Link>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
