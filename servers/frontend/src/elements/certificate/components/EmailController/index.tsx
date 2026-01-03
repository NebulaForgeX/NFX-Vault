import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";

import styles from "./styles.module.css";

const EmailController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplyCertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.email")} <span className={styles.required}>*</span>
      </label>
      <input
        {...register("email")}
        type="email"
        placeholder={t("form.emailPlaceholder")}
        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
      />
      {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
    </div>
  );
});

EmailController.displayName = "EmailController";

export default EmailController;

