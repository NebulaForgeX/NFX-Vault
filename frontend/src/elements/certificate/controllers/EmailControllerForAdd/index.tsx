import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "nfx-ui/components";
import styles from "./styles.module.css";

interface EmailControllerForAddProps {
  /** 新建申请页为必填 */
  requireEmail?: boolean;
}

const EmailControllerForAdd = memo(({ requireEmail = false }: EmailControllerForAddProps) => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.email")}
        {requireEmail ? <span className={styles.required}> *</span> : null}
      </label>
      <Input
        {...register("email")}
        type="email"
        placeholder={t("form.emailPlaceholder")}
        error={errors.email?.message}
      />
    </div>
  );
});

EmailControllerForAdd.displayName = "EmailControllerForAdd";

export default EmailControllerForAdd;

