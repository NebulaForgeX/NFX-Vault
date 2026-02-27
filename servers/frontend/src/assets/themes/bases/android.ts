import type { BaseTheme, BaseVariables } from "../types";
import { BaseEnum } from "../types";

export const androidBaseVariables: BaseVariables = {
  buttonRadius: 6,
  cardRadius: 6,
  inputRadius: 6,
};

export const androidBaseTheme: BaseTheme = {
  name: BaseEnum.ANDROID,
  displayName: "Android",
  variables: androidBaseVariables,
};
