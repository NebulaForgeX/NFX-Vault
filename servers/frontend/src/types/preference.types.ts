/**
 * 偏好/仪表盘类型定义 - 与 NFX-Identity/console 结构对齐
 */
export type DashboardBackgroundType = "waves" | "squares" | "letterGlitch" | "pixelBlast" | "none";

export const DEFAULT_DASHBOARD_BACKGROUND: DashboardBackgroundType = "none";

export const DASHBOARD_BACKGROUND_VALUES: readonly DashboardBackgroundType[] = [
  "waves",
  "squares",
  "letterGlitch",
  "pixelBlast",
  "none",
] as const;
