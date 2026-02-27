// 基础颜色变量类型（与 NFX-Identity/console 对齐）
export interface BaseThemeVariables {
  primary: string;
  primaryLight: string;
  primaryFg: string;
  success: string;
  successLight: string;
  info: string;
  infoLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  danger: string;
  dangerLight: string;

  bg: string;
  bg2: string;
  bg3: string;
  bg4: string;

  border: string;
  border2: string;
  border3: string;
  border4: string;
  border5: string;

  fg: string;
  fgText: string;
  fgHeading: string;
  fgHighlight: string;
  separator: string;
}

// 非颜色变量（圆角等，可随平台不同，与 console bases 一致）
export interface BaseVariables {
  buttonRadius: number;
  cardRadius: number;
  inputRadius: number;
}

/** 基础主题（圆角等） */
export interface BaseTheme {
  name: string;
  displayName: string;
  variables: BaseVariables;
}

// 扩展颜色变量（图表等）
export interface ExtendedThemeVariables extends BaseThemeVariables {
  temperature: {
    arcFill: string[];
    arcEmpty: string;
    thumbBg: string;
    thumbBorder: string;
  };

  solar: {
    gradientLeft: string;
    gradientRight: string;
    shadowColor: string;
    secondSeriesFill: string;
    radius: [string, string];
  };

  traffic: {
    tooltipBg: string;
    tooltipBorderColor: string;
    tooltipExtraCss: string;
    tooltipTextColor: string;
    tooltipFontWeight: string;
    yAxisSplitLine: string;
    lineBg: string;
    lineShadowBlur: string;
    itemColor: string;
    itemBorderColor: string;
    itemEmphasisBorderColor: string;
    shadowLineDarkBg: string;
    shadowLineShadow: string;
    gradFrom: string;
    gradTo: string;
  };

  electricity: {
    tooltipBg: string;
    tooltipLineColor: string;
    tooltipLineWidth: string;
    tooltipBorderColor: string;
    tooltipExtraCss: string;
    tooltipTextColor: string;
    tooltipFontWeight: string;
    axisLineColor: string;
    xAxisTextColor: string;
    yAxisSplitLine: string;
    itemBorderColor: string;
    lineStyle: string;
    lineWidth: string;
    lineGradFrom: string;
    lineGradTo: string;
    lineShadow: string;
    areaGradFrom: string;
    areaGradTo: string;
    shadowLineDarkBg: string;
  };

  echarts: {
    bg: string;
    textColor: string;
    axisLineColor: string;
    splitLineColor: string;
    itemHoverShadowColor: string;
    tooltipBackgroundColor: string;
    areaOpacity: string;
  };

  chartjs: {
    axisLineColor: string;
    textColor: string;
  };
}

/** 颜色变量（与 NFX-Identity/console ColorVariables 对齐，别名） */
export type ColorVariables = ExtendedThemeVariables;

/** 颜色主题 */
export interface ColorTheme {
  name: string;
  displayName: string;
  variables: ExtendedThemeVariables;
}

/** 完整主题 = 颜色主题 + 基础主题（与 NFX-Identity/console 一致） */
export interface Theme {
  colors: ColorTheme;
  base: BaseTheme;
}

// 主题枚举（颜色主题）- 与 NFX-Identity/console 一致
export const ThemeEnum = {
  DEFAULT: "default",
  LIGHT: "light",
  DARK: "dark",
  COSMIC: "cosmic",
  CORPORATE: "corporate",
  FOREST: "forest",
  COFFEE: "coffee",
  WINE: "wine",
} as const;

export type ThemeName = (typeof ThemeEnum)[keyof typeof ThemeEnum];
export const THEME_VALUES: ThemeName[] = Object.values(ThemeEnum);
export const DEFAULT_THEME = ThemeEnum.DEFAULT;

// 基础主题枚举（圆角风格）
export const BaseEnum = {
  DEFAULT: "default",
  IOS: "ios",
  ANDROID: "android",
  WINDOWS: "windows",
  LINUX: "linux",
} as const;

export type BaseName = (typeof BaseEnum)[keyof typeof BaseEnum];
export const BASE_VALUES: BaseName[] = Object.values(BaseEnum);
export const DEFAULT_BASE = BaseEnum.DEFAULT;
