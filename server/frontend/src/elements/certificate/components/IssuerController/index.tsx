import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "../DomainController/styles.module.css";

const IssuerController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.issuer") || "颁发者"}
      </label>
      <Input
        {...register("issuer")}
        type="text"
        placeholder={t("form.issuerPlaceholder") || "例如: Let's Encrypt"}
        error={!!errors.issuer}
      />
      {errors.issuer && <p className={styles.errorMessage}>{errors.issuer.message}</p>}
    </div>
  );
});

IssuerController.displayName = "IssuerController";

export default IssuerController;

