import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { LanguageEnum, useLanguageLabel, useThemeLabel } from "nfx-ui/languages";
import { SlideDownSwitcher } from "nfx-ui/components";
import { useTheme } from "nfx-ui/themes";

import { ROUTES } from "@/navigations";
import { useAuthStore } from "@/stores/authStore";

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import styles from "./styles.module.css";

const LANGUAGE_OPTIONS: LanguageEnum[] = [LanguageEnum.EN, LanguageEnum.ZH, LanguageEnum.FR];

const LoginPage = memo(() => {
  const [isRegister, setIsRegister] = useState(false);
  const { i18n } = useTranslation();
  const isAuthValid = useAuthStore((s) => s.isAuthValid);
  const { themeName, setTheme, availableThemes } = useTheme();
  const { getLanguageDisplayName } = useLanguageLabel();
  const { getThemeDisplayName } = useThemeLabel();

  const languageValue = (i18n.language as LanguageEnum) || LanguageEnum.ZH;

  if (isAuthValid) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.topControls}>
        <SlideDownSwitcher
          value={languageValue}
          options={LANGUAGE_OPTIONS}
          getDisplayName={getLanguageDisplayName}
          onChange={(lng) => i18n.changeLanguage(lng)}
          status="default"
        />
        <SlideDownSwitcher
          value={themeName}
          options={availableThemes}
          getDisplayName={getThemeDisplayName}
          onChange={setTheme}
          status="default"
        />
      </div>

      <div className={styles.container}>
        <input
          type="checkbox"
          id="register_toggle"
          checked={isRegister}
          onChange={(e) => setIsRegister(e.target.checked)}
          className={styles.registerToggle}
        />
        <div className={styles.slider}>
          <LoginForm />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
});

LoginPage.displayName = "LoginPage";
export default LoginPage;
