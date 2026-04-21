"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COLOR_SCHEME_QUERY,
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
} from "@/src/features/theme/constants/theme";
import type {
  ResolvedTheme,
  ThemeController,
  ThemePreference,
} from "@/src/types/theme";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const getInitialThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PREFERENCE;
  }

  const rootPreference = document.documentElement.dataset.themePreference ?? null;
  if (isThemePreference(rootPreference)) {
    return rootPreference;
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(storedTheme)
    ? storedTheme
    : DEFAULT_THEME_PREFERENCE;
};

const getInitialSystemDark = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
};

const resolveTheme = (
  theme: ThemePreference,
  isSystemDark: boolean,
): ResolvedTheme => {
  if (theme !== "system") {
    return theme;
  }
  return isSystemDark ? "dark" : "light";
};

const applyThemeToRoot = (
  theme: ThemePreference,
  resolvedTheme: ResolvedTheme,
) => {
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = theme;
};

export const useThemePreference = (): ThemeController => {
  const [theme, setThemeState] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const [isSystemDark, setIsSystemDark] = useState<boolean>(
    getInitialSystemDark,
  );
  const resolvedTheme = useMemo(
    () => resolveTheme(theme, isSystemDark),
    [isSystemDark, theme],
  );

  useEffect(() => {
    applyThemeToRoot(theme, resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = (event?: MediaQueryListEvent) => {
      setIsSystemDark(event?.matches ?? mediaQuery.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
  }, []);

  return useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );
};
