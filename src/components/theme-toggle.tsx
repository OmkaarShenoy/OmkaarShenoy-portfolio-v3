"use client";

import { useTheme } from "next-themes";
import { Lamp, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-ink/5"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-sun transition-transform group-hover:rotate-12" />
      ) : (
        <Moon size={20} className="text-ink transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}
