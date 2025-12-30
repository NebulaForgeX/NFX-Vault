import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "../DomainController/styles.module.css";

const FolderNameController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.folderName") || "文件夹名称"}
      </label>
      <input
        {...register("folder_name")}
        type="text"
        placeholder={t("form.folderNamePlaceholder") || "例如: api_lucaslyu_com"}
        className={`${styles.input} ${errors.folder_name ? styles.inputError : ""}`}
      />
      {errors.folder_name && <p className={styles.errorMessage}>{errors.folder_name.message}</p>}
      <p className={styles.helpText}>
        {t("form.folderNameHelp") || "唯一标识符，只能包含字母、数字、下划线和连字符"}
      </p>
    </div>
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;

