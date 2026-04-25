"use client";

import clsx from "clsx";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-3 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-2.5 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:rgba(201,146,42,0.45)]"
    >
      <span className="relative flex h-7 w-12 items-center rounded-full bg-[color:var(--tag-bg)] p-1">
        <span
          className={clsx(
            "h-5 w-5 rounded-full transition-transform duration-300",
            isDark ? "translate-x-5 bg-goldLight" : "translate-x-0 bg-greenDeep"
          )}
        />
      </span>
      <span className="hidden sm:block">{isDark ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
