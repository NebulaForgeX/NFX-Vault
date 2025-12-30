import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

interface SANsControllerProps {
  disabled?: boolean;
  readOnly?: boolean;
}

const SANsController = memo(({ disabled = false, readOnly = false }: SANsControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { register, watch, setValue } = useFormContext<ApplyCertificateFormValues>();
  
  const sans = watch("sans");

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{t("form.sans")}</h3>
      <textarea
        {...register("sans")}
        value={sans?.join("\n") || ""}
        onChange={(e) => {
          if (!readOnly && !disabled) {
            const lines = e.target.value.split("\n").filter((line) => line.trim());
            setValue("sans", lines);
          }
        }}
        placeholder={t("form.sansPlaceholder")}
        className={styles.textarea}
        rows={5}
        disabled={disabled || readOnly}
      />
      <p className={styles.helpText}>
        {readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}
      </p>
    </div>
  );
});

SANsController.displayName = "SANsController";

export default SANsController;

