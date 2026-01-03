"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300/50 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:scale-[1.02] hover:border-accent/60 hover:shadow-lg dark:border-slate-600/60"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun size={16} /> Light mode
        </>
      ) : (
        <>
          <Moon size={16} /> Dark mode
        </>
      )}
    </button>
  );
}
