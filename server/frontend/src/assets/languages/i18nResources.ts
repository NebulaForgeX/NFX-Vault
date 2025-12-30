import type { ValueOf } from "@/utils/types";

import en_cert from "./en/cert.json";
import en_certEditApply from "./en/certEditApply.json";
import en_common from "./en/common.json";
import en_navigation from "./en/navigation.json";
import fr_cert from "./fr/cert.json";
import fr_certEditApply from "./fr/certEditApply.json";
import fr_common from "./fr/common.json";
import fr_navigation from "./fr/navigation.json";
import zh_cert from "./zh/cert.json";
import zh_certEditApply from "./zh/certEditApply.json";
import zh_common from "./zh/common.json";
import zh_navigation from "./zh/navigation.json";

// 所有语言包内容
export const RESOURCES = {
  en: {
    cert: en_cert,
    certEditApply: en_certEditApply,
    navigation: en_navigation,
    common: en_common,
  },
  zh: {
    cert: zh_cert,
    certEditApply: zh_certEditApply,
    navigation: zh_navigation,
    common: zh_common,
  },
  fr: {
    cert: fr_cert,
    certEditApply: fr_certEditApply,
    navigation: fr_navigation,
    common: fr_common,
  },
};

// 所有命名空间
export const NAME_SPACES_MAP = {
  cert: "cert",
  certEditApply: "certEditApply",
  navigation: "navigation",
  common: "common",
};

export const NAME_SPACES = Object.values(NAME_SPACES_MAP);

// 所有语言类型
export const LANGUAGE = {
  EN: "en",
  ZH: "zh",
  FR: "fr",
} as const;

export type Language = ValueOf<typeof LANGUAGE>;
