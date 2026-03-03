import { memo } from "react";
import { useTranslation } from "react-i18next";

import { LanguageEnum, changeLanguage, getLanguageDisplayName } from "nfx-ui/languages";
import { SlideDownSwitcher } from "nfx-ui/components";
import { Search } from "@/assets/icons/lucide";
import { showSearch } from "@/stores/modalStore";

import styles from "./styles.module.css";

const LANGUAGE_OPTIONS: LanguageEnum[] = [LanguageEnum.EN, LanguageEnum.ZH, LanguageEnum.FR];

const RightContainer = memo(() => {
  const { i18n } = useTranslation();
  const languageValue = (i18n.language as LanguageEnum) || LanguageEnum.ZH;

  const handleLanguageChange = (lng: LanguageEnum) => {
    changeLanguage(lng);
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.actions}>
        <SlideDownSwitcher
          value={languageValue}
          options={LANGUAGE_OPTIONS}
          getDisplayName={getLanguageDisplayName}
          onChange={handleLanguageChange}
          status="default"
        />
        <div className={styles.separator} />
        <button className={`${styles.action} ${styles.controlItem}`} onClick={() => showSearch()}>
          <Search size={20} />
        </button>
      </div>
    </div>
  );
});

RightContainer.displayName = "RightContainer";

export default RightContainer;
