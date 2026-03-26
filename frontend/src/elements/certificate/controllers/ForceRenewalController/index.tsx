import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "../EmailControllerForAdd/styles.module.css";

const ForceRenewalController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const { control } = useFormContext<CertificateFormSharedValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
        <Controller
          name="forceRenewal"
          control={control}
          render={({ field }) => (
            <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
          )}
        />
        <span>{t("form.forceRenewal")}</span>
      </label>
      <p style={{ margin: 0, color: "var(--color-fg-muted)", fontSize: "0.8125rem", lineHeight: 1.4 }}>{t("form.forceRenewalHelp")}</p>
    </div>
  );
});

ForceRenewalController.displayName = "ForceRenewalController";

export default ForceRenewalController;
