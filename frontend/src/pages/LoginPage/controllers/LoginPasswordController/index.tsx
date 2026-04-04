import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";

import type { EmailLoginFormValues } from "../../schemas/loginSchema";

import styles from "../inputField.module.css";

const LoginPasswordController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const {
    control,
    formState: { errors },
  } = useFormContext<EmailLoginFormValues>();

  const passwordError = errors.password;

  return (
    <div className={styles.formControl}>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <div className={styles.inputWrapper}>
            <input
              {...field}
              type="password"
              className={`${styles.input} ${passwordError ? styles.error : ""}`}
              autoComplete="current-password"
            />
            <label className={styles.label}>{t("password")}</label>
            <div className={styles.textWrapper}>
              <div className={styles.innerTextWrapper}>
                {passwordError && <span className={styles.errorText}>{passwordError.message}</span>}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
});

LoginPasswordController.displayName = "LoginPasswordController";

export default LoginPasswordController;
