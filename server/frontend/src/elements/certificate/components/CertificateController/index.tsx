import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

const CertificateController = memo(() => {
  const { t } = useTranslation("cert");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.certificate") || "证书内容"} <span className={styles.required}>*</span>
      </label>
      <textarea
        {...register("certificate")}
        placeholder={t("form.certificatePlaceholder") || "请输入PEM格式的证书内容"}
        className={`${styles.textarea} ${errors.certificate ? styles.inputError : ""}`}
        rows={10}
      />
      {errors.certificate && <p className={styles.errorMessage}>{errors.certificate.message}</p>}
    </div>
  );
});

CertificateController.displayName = "CertificateController";

export default CertificateController;

