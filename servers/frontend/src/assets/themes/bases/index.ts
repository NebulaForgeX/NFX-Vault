import type { BaseName, BaseTheme } from "../types";
import { BaseEnum } from "../types";
import { androidBaseTheme } from "./android";
import { defaultBaseTheme } from "./default";
import { iosBaseTheme } from "./ios";
import { linuxBaseTheme } from "./linux";
import { windowsBaseTheme } from "./windows";

export const bases: Record<BaseName, BaseTheme> = {
  [BaseEnum.DEFAULT]: defaultBaseTheme,
  [BaseEnum.IOS]: iosBaseTheme,
  [BaseEnum.ANDROID]: androidBaseTheme,
  [BaseEnum.WINDOWS]: windowsBaseTheme,
  [BaseEnum.LINUX]: linuxBaseTheme,
};

export { defaultBaseTheme, defaultBaseVariables } from "./default";
export { iosBaseTheme, iosBaseVariables } from "./ios";
export { androidBaseTheme, androidBaseVariables } from "./android";
export { windowsBaseTheme, windowsBaseVariables } from "./windows";
export { linuxBaseTheme, linuxBaseVariables } from "./linux";
