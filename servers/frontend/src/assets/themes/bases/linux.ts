import type { BaseTheme, BaseVariables } from "../types";
import { BaseEnum } from "../types";

export const linuxBaseVariables: BaseVariables = {
  buttonRadius: 4,
  cardRadius: 4,
  inputRadius: 4,
};

export const linuxBaseTheme: BaseTheme = {
  name: BaseEnum.LINUX,
  displayName: "Linux",
  variables: linuxBaseVariables,
};
