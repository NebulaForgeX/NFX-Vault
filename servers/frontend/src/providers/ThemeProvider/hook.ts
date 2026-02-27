import { useEffect } from "react";
import type { Theme, ThemeName, BaseName } from "@/assets/themes/types";

/**
 * 将主题变量注入到 CSS Variables（与 NFX-Identity/console 一致）
 */
export function useThemeVariables(currentTheme: Theme, themeName: ThemeName, baseName: BaseName) {
  useEffect(() => {
    const root = document.documentElement;
    const vars = currentTheme.colors.variables;
    const base = currentTheme.base.variables;

    // 基础颜色
    root.style.setProperty("--color-primary", vars.primary);
    root.style.setProperty("--color-primary-light", vars.primaryLight);
    root.style.setProperty("--color-primary-fg", vars.primaryFg);
    root.style.setProperty("--color-success", vars.success);
    root.style.setProperty("--color-success-light", vars.successLight);
    root.style.setProperty("--color-info", vars.info);
    root.style.setProperty("--color-info-light", vars.infoLight);
    root.style.setProperty("--color-warning", vars.warning);
    root.style.setProperty("--color-warning-light", vars.warningLight);
    root.style.setProperty("--color-error", vars.error);
    root.style.setProperty("--color-error-light", vars.errorLight);
    root.style.setProperty("--color-danger", vars.danger);
    root.style.setProperty("--color-danger-light", vars.dangerLight);

    // 背景色
    root.style.setProperty("--color-bg", vars.bg);
    root.style.setProperty("--color-bg-2", vars.bg2);
    root.style.setProperty("--color-bg-3", vars.bg3);
    root.style.setProperty("--color-bg-4", vars.bg4);

    // 边框色
    root.style.setProperty("--color-border", vars.border);
    root.style.setProperty("--color-border-2", vars.border2);
    root.style.setProperty("--color-border-3", vars.border3);
    root.style.setProperty("--color-border-4", vars.border4);
    root.style.setProperty("--color-border-5", vars.border5);

    // 文字色
    root.style.setProperty("--color-fg", vars.fg);
    root.style.setProperty("--color-fg-text", vars.fgText);
    root.style.setProperty("--color-fg-heading", vars.fgHeading);
    root.style.setProperty("--color-fg-highlight", vars.fgHighlight);

    // 分隔符
    root.style.setProperty("--color-separator", vars.separator);

    // ECharts 颜色
    root.style.setProperty("--echarts-bg", vars.echarts.bg);
    root.style.setProperty("--echarts-text-color", vars.echarts.textColor);
    root.style.setProperty("--echarts-axis-line-color", vars.echarts.axisLineColor);
    root.style.setProperty("--echarts-split-line-color", vars.echarts.splitLineColor);
    root.style.setProperty("--echarts-item-hover-shadow-color", vars.echarts.itemHoverShadowColor);
    root.style.setProperty("--echarts-tooltip-bg-color", vars.echarts.tooltipBackgroundColor);
    root.style.setProperty("--echarts-area-opacity", vars.echarts.areaOpacity);

    // ChartJS 颜色
    root.style.setProperty("--chartjs-axis-line-color", vars.chartjs.axisLineColor);
    root.style.setProperty("--chartjs-text-color", vars.chartjs.textColor);

    // 基础变量（圆角，与 console bases 一致）
    root.style.setProperty("--radius-button", `${base.buttonRadius}px`);
    root.style.setProperty("--radius-card", `${base.cardRadius}px`);
    root.style.setProperty("--radius-input", `${base.inputRadius}px`);

    localStorage.setItem("theme", themeName);
    localStorage.setItem("base", baseName);
  }, [themeName, baseName, currentTheme]);
}
