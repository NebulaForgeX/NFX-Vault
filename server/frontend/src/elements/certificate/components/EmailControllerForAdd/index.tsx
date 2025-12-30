import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "../DomainController/styles.module.css";

const EmailControllerForAdd = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.email") || "邮箱地址"}
      </label>
      <input
        {...register("email")}
        type="email"
        placeholder={t("form.emailPlaceholder") || "admin@example.com"}
        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
      />
      {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
    </div>
  );
});

EmailControllerForAdd.displayName = "EmailControllerForAdd";

export default EmailControllerForAdd;

