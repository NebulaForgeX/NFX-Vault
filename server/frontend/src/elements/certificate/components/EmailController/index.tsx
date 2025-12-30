import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

const EmailController = memo(() => {
  const { t } = useTranslation("certApply");
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplyCertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("apply.email") || "邮箱地址"} <span className={styles.required}>*</span>
      </label>
      <input
        {...register("email")}
        type="email"
        placeholder={t("apply.emailPlaceholder") || "admin@example.com"}
        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
      />
      {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
    </div>
  );
});

EmailController.displayName = "EmailController";

export default EmailController;

