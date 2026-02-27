import type { Theme, ThemeName } from "../types";
import { ThemeEnum } from "../types";
import { defaultBaseTheme } from "../bases/default";
import { coffeeColorTheme } from "./coffee";
import { corporateColorTheme } from "./corporate";
import { cosmicColorTheme } from "./cosmic";
import { darkColorTheme } from "./dark";
import { defaultColorTheme } from "./default";
import { forestColorTheme } from "./forest";
import { lightColorTheme } from "./light";
import { wineColorTheme } from "./wine";

export const defaultTheme: Theme = { colors: defaultColorTheme, base: defaultBaseTheme };
export const lightTheme: Theme = { colors: lightColorTheme, base: defaultBaseTheme };
export const darkTheme: Theme = { colors: darkColorTheme, base: defaultBaseTheme };
export const cosmicTheme: Theme = { colors: cosmicColorTheme, base: defaultBaseTheme };
export const corporateTheme: Theme = { colors: corporateColorTheme, base: defaultBaseTheme };
export const forestTheme: Theme = { colors: forestColorTheme, base: defaultBaseTheme };
export const coffeeTheme: Theme = { colors: coffeeColorTheme, base: defaultBaseTheme };
export const wineTheme: Theme = { colors: wineColorTheme, base: defaultBaseTheme };

export const colorThemes = {
  [ThemeEnum.DEFAULT]: defaultColorTheme,
  [ThemeEnum.LIGHT]: lightColorTheme,
  [ThemeEnum.DARK]: darkColorTheme,
  [ThemeEnum.COSMIC]: cosmicColorTheme,
  [ThemeEnum.CORPORATE]: corporateColorTheme,
  [ThemeEnum.FOREST]: forestColorTheme,
  [ThemeEnum.COFFEE]: coffeeColorTheme,
  [ThemeEnum.WINE]: wineColorTheme,
} as Record<ThemeName, Theme["colors"]>;

export const themes: Record<ThemeName, Theme> = {
  [ThemeEnum.DEFAULT]: defaultTheme,
  [ThemeEnum.LIGHT]: lightTheme,
  [ThemeEnum.DARK]: darkTheme,
  [ThemeEnum.COSMIC]: cosmicTheme,
  [ThemeEnum.CORPORATE]: corporateTheme,
  [ThemeEnum.FOREST]: forestTheme,
  [ThemeEnum.COFFEE]: coffeeTheme,
  [ThemeEnum.WINE]: wineTheme,
};

export {
  defaultColorTheme,
  lightColorTheme,
  darkColorTheme,
  cosmicColorTheme,
  corporateColorTheme,
  forestColorTheme,
  coffeeColorTheme,
  wineColorTheme,
};
