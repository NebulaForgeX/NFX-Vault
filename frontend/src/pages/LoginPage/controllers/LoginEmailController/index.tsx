import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";

import type { EmailLoginFormValues } from "../../schemas/loginSchema";

import styles from "../inputField.module.css";

const LoginEmailController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const {
    control,
    formState: { errors },
  } = useFormContext<EmailLoginFormValues>();

  const emailError = errors.email;

  return (
    <div className={styles.formControl}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <div className={styles.inputWrapper}>
            <input
              {...field}
              type="email"
              className={`${styles.input} ${emailError ? styles.error : ""}`}
              autoComplete="email"
            />
            <label className={styles.label}>{t("email")}</label>
            <div className={styles.textWrapper}>
              <div className={styles.innerTextWrapper}>
                {emailError && <span className={styles.errorText}>{emailError.message}</span>}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
});

LoginEmailController.displayName = "LoginEmailController";

export default LoginEmailController;
