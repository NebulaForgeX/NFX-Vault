import type { BaseTheme, BaseVariables } from "../types";
import { BaseEnum } from "../types";

export const windowsBaseVariables: BaseVariables = {
  buttonRadius: 6,
  cardRadius: 6,
  inputRadius: 6,
};

export const windowsBaseTheme: BaseTheme = {
  name: BaseEnum.WINDOWS,
  displayName: "Windows",
  variables: windowsBaseVariables,
};
