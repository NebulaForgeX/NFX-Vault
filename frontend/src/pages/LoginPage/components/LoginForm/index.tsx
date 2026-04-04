import { memo } from "react";
import { useTranslation } from "react-i18next";

import LoginEmailForm from "../LoginEmailForm";

import styles from "./styles.module.css";

/** Vault：仅邮箱登录（无手机登录 Tab） */
const LoginForm = memo(() => {
  const { t } = useTranslation("LoginPage");

  return (
    <div className={styles.formWrapper}>
      <div className={styles.form}>
        <span className={styles.title}>{t("login")}</span>
        <LoginEmailForm />
      </div>
    </div>
  );
});

LoginForm.displayName = "LoginForm";
export default LoginForm;
