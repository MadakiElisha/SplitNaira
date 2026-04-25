"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create split" },
  { href: "/profile", label: "Profile" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 shadow-soft backdrop-blur-xl">
        <Link href="/" className="min-w-0 flex-1">
          <BrandMark compact />
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav className="flex flex-wrap items-center justify-end gap-1">
            {navigationItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[color:var(--surface-strong)] text-[color:var(--ink)] shadow-[0_16px_40px_-30px_rgba(20,20,18,0.65)]"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--tag-bg)] hover:text-[color:var(--ink)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
