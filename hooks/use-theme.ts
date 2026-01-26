"use client";

import { useEffect, useState } from "react";
import { type Theme, getTheme, setTheme, applyTheme } from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("violet-night");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    applyTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "violet-night" ? "ice-blue" : "violet-night";
    setThemeState(newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    toggleTheme,
    mounted,
  };
}
