import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "nfx-ui/components";
import styles from "../DomainController/styles.module.css";

const FolderNameController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  const folderNameRegister = useMemo(
    () => register("folderName"),
    [register]
  );

  const displayError = errors.folderName?.message;

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.folderName")}
      </label>
      <Input
        {...folderNameRegister}
        type="text"
        placeholder={t("form.folderNamePlaceholder")}
        error={displayError}
        helperText={!displayError ? t("form.folderNameHelp") : undefined}
      />
    </div>
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;
