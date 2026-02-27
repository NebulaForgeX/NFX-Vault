import type { ReactNode } from "react";
import type { Theme, ThemeName, BaseName } from "@/assets/themes/types";

import { createContext, useContext, useMemo, useState } from "react";

import { BASE_VALUES, THEME_VALUES } from "@/assets/themes/types";
import { bases } from "@/assets/themes/bases";
import { colorThemes } from "@/assets/themes/colors";

import { useThemeVariables } from "./hook";

export interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  baseName: BaseName;
  setTheme: (themeName: ThemeName) => void;
  setBase: (baseName: BaseName) => void;
  availableThemes: ThemeName[];
  availableBases: BaseName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
  defaultBase?: BaseName;
}

export function ThemeProvider({
  children,
  defaultTheme = "default",
  defaultBase = "default",
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("theme") as ThemeName | null;
    return saved && THEME_VALUES.includes(saved) ? saved : defaultTheme;
  });
  const [baseName, setBaseName] = useState<BaseName>(() => {
    const saved = localStorage.getItem("base") as BaseName | null;
    return saved && BASE_VALUES.includes(saved) ? saved : defaultBase;
  });

  const currentTheme = useMemo<Theme>(
    () => ({ colors: colorThemes[themeName], base: bases[baseName] }),
    [themeName, baseName],
  );

  useThemeVariables(currentTheme, themeName, baseName);

  const setTheme = (newTheme: ThemeName) => setThemeName(newTheme);
  const setBase = (newBase: BaseName) => setBaseName(newBase);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        baseName,
        setTheme,
        setBase,
        availableThemes: THEME_VALUES,
        availableBases: BASE_VALUES,
      }}
    >
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
