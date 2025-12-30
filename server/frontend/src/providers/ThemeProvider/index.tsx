import type { ReactNode } from "react";
import type { Theme, ThemeName } from "@/assets/themes/types";

import { createContext, useContext, useState } from "react";

import { themes } from "@/assets/themes/base";
import { useThemeVariables } from "./hook";

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export function ThemeProvider({ children, defaultTheme = "default" }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("theme") as ThemeName | null;
    return saved && saved in themes ? saved : defaultTheme;
  });

  const currentTheme = themes[themeName];

  // 应用主题变量到 CSS
  useThemeVariables(themeName, currentTheme);

  const setTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
  };

  const availableThemes: ThemeName[] = ["default", "light", "dark", "cosmic", "corporate"];

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

