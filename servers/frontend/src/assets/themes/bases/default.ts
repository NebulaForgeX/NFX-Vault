import type { BaseTheme, BaseVariables } from "../types";
import { BaseEnum } from "../types";

export const defaultBaseVariables: BaseVariables = {
  buttonRadius: 8,
  cardRadius: 8,
  inputRadius: 6,
};

export const defaultBaseTheme: BaseTheme = {
  name: BaseEnum.DEFAULT,
  displayName: "Default",
  variables: defaultBaseVariables,
};
