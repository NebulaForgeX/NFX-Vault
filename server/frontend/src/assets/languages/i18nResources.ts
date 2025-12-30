import type { ValueOf } from "@/utils/types";

// Page translations
import en_certCheck from "./en/certCheck.json";
import en_certDetail from "./en/certDetail.json";
import en_certEdit from "./en/certEdit.json";
import en_certAdd from "./en/certAdd.json";
import en_certApply from "./en/certApply.json";
import en_certEditApply from "./en/certEditApply.json";
// Elements translations
import en_certificateElements from "./en/certificateElements.json";
// Provider translations
import en_modal from "./en/modal.json";
// Common translations
import en_common from "./en/common.json";
import en_navigation from "./en/navigation.json";

import fr_certCheck from "./fr/certCheck.json";
import fr_certDetail from "./fr/certDetail.json";
import fr_certEdit from "./fr/certEdit.json";
import fr_certAdd from "./fr/certAdd.json";
import fr_certApply from "./fr/certApply.json";
import fr_certEditApply from "./fr/certEditApply.json";
import fr_certificateElements from "./fr/certificateElements.json";
import fr_modal from "./fr/modal.json";
import fr_common from "./fr/common.json";
import fr_navigation from "./fr/navigation.json";

import zh_certCheck from "./zh/certCheck.json";
import zh_certDetail from "./zh/certDetail.json";
import zh_certEdit from "./zh/certEdit.json";
import zh_certAdd from "./zh/certAdd.json";
import zh_certApply from "./zh/certApply.json";
import zh_certEditApply from "./zh/certEditApply.json";
import zh_certificateElements from "./zh/certificateElements.json";
import zh_modal from "./zh/modal.json";
import zh_common from "./zh/common.json";
import zh_navigation from "./zh/navigation.json";

// 所有语言包内容
export const RESOURCES = {
  en: {
    certCheck: en_certCheck,
    certDetail: en_certDetail,
    certEdit: en_certEdit,
    certAdd: en_certAdd,
    certApply: en_certApply,
    certEditApply: en_certEditApply,
    certificateElements: en_certificateElements,
    modal: en_modal,
    navigation: en_navigation,
    common: en_common,
  },
  zh: {
    certCheck: zh_certCheck,
    certDetail: zh_certDetail,
    certEdit: zh_certEdit,
    certAdd: zh_certAdd,
    certApply: zh_certApply,
    certEditApply: zh_certEditApply,
    certificateElements: zh_certificateElements,
    modal: zh_modal,
    navigation: zh_navigation,
    common: zh_common,
  },
  fr: {
    certCheck: fr_certCheck,
    certDetail: fr_certDetail,
    certEdit: fr_certEdit,
    certAdd: fr_certAdd,
    certApply: fr_certApply,
    certEditApply: fr_certEditApply,
    certificateElements: fr_certificateElements,
    modal: fr_modal,
    navigation: fr_navigation,
    common: fr_common,
  },
};

// 所有命名空间
export const NAME_SPACES_MAP = {
  certCheck: "certCheck",
  certDetail: "certDetail",
  certEdit: "certEdit",
  certAdd: "certAdd",
  certApply: "certApply",
  certEditApply: "certEditApply",
  certificateElements: "certificateElements",
  modal: "modal",
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
