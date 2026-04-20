export type ThemePreference = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export type ThemeController = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (nextTheme: ThemePreference) => void;
};
