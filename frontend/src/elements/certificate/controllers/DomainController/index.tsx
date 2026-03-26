import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "nfx-ui/components";
import styles from "./styles.module.css";

const DomainController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.domain")} <span className={styles.required}>*</span>
      </label>
      <Input
        {...register("domain")}
        type="text"
        placeholder={t("form.domainPlaceholder")}
        error={errors.domain?.message}
      />
    </div>
  );
});

DomainController.displayName = "DomainController";

export default DomainController;

