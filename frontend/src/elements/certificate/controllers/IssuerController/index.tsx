import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "nfx-ui/components";
import styles from "./styles.module.css";

const IssuerController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.issuer")}
      </label>
      <Input
        {...register("issuer")}
        type="text"
        placeholder={t("form.issuerPlaceholder")}
        error={errors.issuer?.message}
      />
    </div>
  );
});

IssuerController.displayName = "IssuerController";

export default IssuerController;

