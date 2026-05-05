"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "text-text-primary bg-surface-elevated"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-accent" />
      )}
    </Link>
  );
}
