import type { CertificateFormValues } from "../../controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "./styles.module.css";

const EmailControllerForAdd = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.email")}
      </label>
      <Input
        {...register("email")}
        type="email"
        placeholder={t("form.emailPlaceholder")}
        error={!!errors.email}
      />
      {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
    </div>
  );
});

EmailControllerForAdd.displayName = "EmailControllerForAdd";

export default EmailControllerForAdd;

