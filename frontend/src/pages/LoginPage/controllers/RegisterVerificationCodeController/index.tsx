import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";

import type { RegisterFormValues } from "../../schemas/registerSchema";

import styles from "../inputField.module.css";

const RegisterVerificationCodeController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const {
    control,
    formState: { errors },
  } = useFormContext<RegisterFormValues>();
  const verificationCodeError = errors.verificationCode;

  return (
    <div className={styles.formControl}>
      <Controller
        name="verificationCode"
        control={control}
        render={({ field }) => (
          <div className={styles.inputWrapper}>
            <input
              {...field}
              type="text"
              className={`${styles.input} ${verificationCodeError ? styles.error : ""}`}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => {
                field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
            />
            <label className={styles.label}>{t("verificationCode")}</label>
            <div className={styles.textWrapper}>
              <div className={styles.innerTextWrapper}>
                {verificationCodeError && (
                  <span className={styles.errorText}>{verificationCodeError.message}</span>
                )}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
});

RegisterVerificationCodeController.displayName = "RegisterVerificationCodeController";
export default RegisterVerificationCodeController;
