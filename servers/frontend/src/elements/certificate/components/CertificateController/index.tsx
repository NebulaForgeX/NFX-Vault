import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";
import { Upload } from "@/assets/icons/lucide";

import styles from "./styles.module.css";

const CertificateController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  const certificateValue = watch("certificate");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setValue("certificate", content, { shouldValidate: true });
      };
      reader.readAsText(file);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.certificate")} <span className={styles.required}>*</span>
      </label>
      <div className={styles.uploadArea}>
        <label className={styles.uploadLabel}>
          <Upload size={20} />
          <span>{t("form.uploadCertificate")}</span>
          <input
            type="file"
            accept=".crt,.pem,.cert"
            onChange={handleFileUpload}
            className={styles.fileInput}
          />
        </label>
      </div>
      <textarea
        {...register("certificate")}
        placeholder={t("form.certificatePlaceholder")}
        className={`${styles.textarea} ${errors.certificate ? styles.inputError : ""}`}
        rows={10}
        value={certificateValue || ""}
      />
      {errors.certificate && <p className={styles.errorMessage}>{errors.certificate.message}</p>}
    </div>
  );
});

CertificateController.displayName = "CertificateController";

export default CertificateController;

