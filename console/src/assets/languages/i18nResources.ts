import type { CreateI18nResourcesResult, NameSpacesMap, Resources } from "nfx-ui/languages";

import enHooks from "./en/hooks.json";
import enLanguage from "./en/language.json";
import enAuthShell from "./en/pages/Account/AuthShell.json";
import enLogin from "./en/pages/Account/Login.json";
import enSignup from "./en/pages/Account/Signup.json";
import enUserProfileEdit from "./en/pages/User/Profile/Edit.json";
import enUserProfileIdentities from "./en/pages/User/Profile/Identities.json";
import enUserProfileOverview from "./en/pages/User/Profile/Overview.json";
import enUserSetting from "./en/pages/User/Setting.json";
import enCertCheck from "./en/certCheck.json";
import enCertDetail from "./en/certDetail.json";
import enCertEdit from "./en/certEdit.json";
import enCertAdd from "./en/certAdd.json";
import enCertApply from "./en/certApply.json";
import enCertEditApply from "./en/certEditApply.json";
import enCertSearch from "./en/certSearch.json";
import enTlsAnalysis from "./en/tlsAnalysis.json";
import enCertificateElements from "./en/certificateElements.json";
import enModal from "./en/modal.json";
import enCommon from "./en/common.json";
import enNavigation from "./en/navigation.json";
import enDns from "./en/dns.json";
import enDnsDomain from "./en/dnsDomain.json";

import frHooks from "./fr/hooks.json";
import frLanguage from "./fr/language.json";
import frAuthShell from "./fr/pages/Account/AuthShell.json";
import frLogin from "./fr/pages/Account/Login.json";
import frSignup from "./fr/pages/Account/Signup.json";
import frUserProfileEdit from "./fr/pages/User/Profile/Edit.json";
import frUserProfileIdentities from "./fr/pages/User/Profile/Identities.json";
import frUserProfileOverview from "./fr/pages/User/Profile/Overview.json";
import frUserSetting from "./fr/pages/User/Setting.json";
import frCertCheck from "./fr/certCheck.json";
import frCertDetail from "./fr/certDetail.json";
import frCertEdit from "./fr/certEdit.json";
import frCertAdd from "./fr/certAdd.json";
import frCertApply from "./fr/certApply.json";
import frCertEditApply from "./fr/certEditApply.json";
import frCertSearch from "./fr/certSearch.json";
import frTlsAnalysis from "./fr/tlsAnalysis.json";
import frCertificateElements from "./fr/certificateElements.json";
import frModal from "./fr/modal.json";
import frCommon from "./fr/common.json";
import frNavigation from "./fr/navigation.json";
import frDns from "./fr/dns.json";
import frDnsDomain from "./fr/dnsDomain.json";

import zhHooks from "./zh/hooks.json";
import zhLanguage from "./zh/language.json";
import zhAuthShell from "./zh/pages/Account/AuthShell.json";
import zhLogin from "./zh/pages/Account/Login.json";
import zhSignup from "./zh/pages/Account/Signup.json";
import zhUserProfileEdit from "./zh/pages/User/Profile/Edit.json";
import zhUserProfileIdentities from "./zh/pages/User/Profile/Identities.json";
import zhUserProfileOverview from "./zh/pages/User/Profile/Overview.json";
import zhUserSetting from "./zh/pages/User/Setting.json";
import zhCertCheck from "./zh/certCheck.json";
import zhCertDetail from "./zh/certDetail.json";
import zhCertEdit from "./zh/certEdit.json";
import zhCertAdd from "./zh/certAdd.json";
import zhCertApply from "./zh/certApply.json";
import zhCertEditApply from "./zh/certEditApply.json";
import zhCertSearch from "./zh/certSearch.json";
import zhTlsAnalysis from "./zh/tlsAnalysis.json";
import zhCertificateElements from "./zh/certificateElements.json";
import zhModal from "./zh/modal.json";
import zhCommon from "./zh/common.json";
import zhNavigation from "./zh/navigation.json";
import zhDns from "./zh/dns.json";
import zhDnsDomain from "./zh/dnsDomain.json";

const PAGE = {
  AuthShell: "pages.Account.AuthShell",
  Login: "pages.Account.Login",
  Signup: "pages.Account.Signup",
  UserSetting: "pages.User.Setting",
  UserProfileOverview: "pages.User.Profile.Overview",
  UserProfileEdit: "pages.User.Profile.Edit",
  UserProfileIdentities: "pages.User.Profile.Identities",
} as const;

const BUILTIN_I18N_NAMESPACES_MAP: NameSpacesMap = {
  language: "language",
  hooks: "hooks",
  ...PAGE,
  certCheck: "certCheck",
  certDetail: "certDetail",
  certEdit: "certEdit",
  certAdd: "certAdd",
  certApply: "certApply",
  certEditApply: "certEditApply",
  certSearch: "certSearch",
  tlsAnalysis: "tlsAnalysis",
  certificateElements: "certificateElements",
  modal: "modal",
  navigation: "navigation",
  common: "common",
  dns: "dns",
  dnsDomain: "dnsDomain",
};

export function getBuiltinI18nBundles(): CreateI18nResourcesResult {
  const RESOURCES: Resources = {
    en: {
      language: enLanguage,
      hooks: enHooks,
      [PAGE.AuthShell]: enAuthShell,
      [PAGE.Login]: enLogin,
      [PAGE.Signup]: enSignup,
      [PAGE.UserSetting]: enUserSetting,
      [PAGE.UserProfileOverview]: enUserProfileOverview,
      [PAGE.UserProfileEdit]: enUserProfileEdit,
      [PAGE.UserProfileIdentities]: enUserProfileIdentities,
      certCheck: enCertCheck,
      certDetail: enCertDetail,
      certEdit: enCertEdit,
      certAdd: enCertAdd,
      certApply: enCertApply,
      certEditApply: enCertEditApply,
      certSearch: enCertSearch,
      tlsAnalysis: enTlsAnalysis,
      certificateElements: enCertificateElements,
      modal: enModal,
      navigation: enNavigation,
      common: enCommon,
      dns: enDns,
      dnsDomain: enDnsDomain,
    },
    zh: {
      language: zhLanguage,
      hooks: zhHooks,
      [PAGE.AuthShell]: zhAuthShell,
      [PAGE.Login]: zhLogin,
      [PAGE.Signup]: zhSignup,
      [PAGE.UserSetting]: zhUserSetting,
      [PAGE.UserProfileOverview]: zhUserProfileOverview,
      [PAGE.UserProfileEdit]: zhUserProfileEdit,
      [PAGE.UserProfileIdentities]: zhUserProfileIdentities,
      certCheck: zhCertCheck,
      certDetail: zhCertDetail,
      certEdit: zhCertEdit,
      certAdd: zhCertAdd,
      certApply: zhCertApply,
      certEditApply: zhCertEditApply,
      certSearch: zhCertSearch,
      tlsAnalysis: zhTlsAnalysis,
      certificateElements: zhCertificateElements,
      modal: zhModal,
      navigation: zhNavigation,
      common: zhCommon,
      dns: zhDns,
      dnsDomain: zhDnsDomain,
    },
    fr: {
      language: frLanguage,
      hooks: frHooks,
      [PAGE.AuthShell]: frAuthShell,
      [PAGE.Login]: frLogin,
      [PAGE.Signup]: frSignup,
      [PAGE.UserSetting]: frUserSetting,
      [PAGE.UserProfileOverview]: frUserProfileOverview,
      [PAGE.UserProfileEdit]: frUserProfileEdit,
      [PAGE.UserProfileIdentities]: frUserProfileIdentities,
      certCheck: frCertCheck,
      certDetail: frCertDetail,
      certEdit: frCertEdit,
      certAdd: frCertAdd,
      certApply: frCertApply,
      certEditApply: frCertEditApply,
      certSearch: frCertSearch,
      tlsAnalysis: frTlsAnalysis,
      certificateElements: frCertificateElements,
      modal: frModal,
      navigation: frNavigation,
      common: frCommon,
      dns: frDns,
      dnsDomain: frDnsDomain,
    },
  };
  return {
    RESOURCES,
    NAME_SPACES_MAP: BUILTIN_I18N_NAMESPACES_MAP,
    NAME_SPACES: Object.values(BUILTIN_I18N_NAMESPACES_MAP),
  };
}

export const getBuiltinBundles = getBuiltinI18nBundles;
