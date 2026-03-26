import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "nfx-ui/components";

import styles from "../EmailControllerForAdd/styles.module.css";

const WebrootController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>{t("form.webroot")}</label>
      <Input {...register("webroot")} type="text" placeholder={t("form.webrootPlaceholder")} error={errors.webroot?.message} />
      <p style={{ margin: 0, color: "var(--color-fg-muted)", fontSize: "0.8125rem", lineHeight: 1.4 }}>{t("form.webrootHelp")}</p>
    </div>
  );
});

WebrootController.displayName = "WebrootController";

export default WebrootController;
