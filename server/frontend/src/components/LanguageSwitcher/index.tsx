import type { Language } from "@/assets/languages/i18nResources";

import { memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChangeLanguage, LANGUAGE } from "@/assets/languages/i18n";

import styles from "./styles.module.css";

interface LanguageSwitcherProps {
  status?: "primary" | "default";
}

const LanguageSwitcher = memo(({ status = "primary" }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 语言显示名称映射
  const languageDisplayNames: Record<Language, string> = {
    [LANGUAGE.EN]: "English",
    [LANGUAGE.ZH]: "中文",
    [LANGUAGE.FR]: "Français",
  };

  const currentLanguage = (i18n.language as Language) || LANGUAGE.EN;
  const availableLanguages: Language[] = [LANGUAGE.EN, LANGUAGE.ZH, LANGUAGE.FR];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (lng: Language) => {
    ChangeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className={styles.nbSelect} ref={wrapperRef}>
      <button
        className={`${styles.selectButton} ${styles[status]}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.buttonText}>{languageDisplayNames[currentLanguage] || currentLanguage}</span>
        <svg
          className={`${styles.chevronIcon} ${isOpen ? styles.open : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={`${styles.optionsPanel} ${styles[status]}`}>
          <ul className={styles.optionsList} role="listbox">
            {availableLanguages.map((lng) => (
              <li
                key={lng}
                className={`${styles.option} ${lng === currentLanguage ? styles.selected : ""}`}
                onClick={() => handleLanguageChange(lng)}
                role="option"
                aria-selected={lng === currentLanguage}
              >
                <span>{languageDisplayNames[lng] || lng}</span>
                {lng === currentLanguage && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

LanguageSwitcher.displayName = "LanguageSwitcher";

export default LanguageSwitcher;

