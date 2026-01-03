import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "@/elements/certificate/controllers/applyCertificateSchema";
import type { CertificateDetailResponse } from "@/apis/domain";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";

import { Input, Button } from "@/components";
import { ROUTES } from "@/types/navigation";
import type { CertType } from "@/types";
import { ForceRenewalController, SANsController, WebrootController } from "@/elements/certificate/components";
import styles from "./styles.module.css";

interface ManualAddFormProps {
  onSubmit: (data: ApplyCertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<ApplyCertificateFormValues>) => void;
  isPending: boolean;
  certificate: CertificateDetailResponse;
}

/**
 * MANUAL_ADD 源证书重新申请表单 - 所有字段只读，只更新证书内容和私钥
 */
const ManualAddForm = memo(({ onSubmit, onSubmitError, isPending, certificate }: ManualAddFormProps) => {
  const { t } = useTranslation("certEditApply");
  const navigate = useNavigate();
  const methods = useFormContext<ApplyCertificateFormValues>();
  const { watch, handleSubmit } = methods;
  
  const domain = watch("domain");
  const folderName = watch("folderName");
  const email = watch("email");

  const handleEditClick = () => {
    const certType = (certificate.store as CertType) || "database";
    navigate(`${ROUTES.CERT_EDIT}?domain=${domain}&source=${certificate.source}&certType=${certType}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {t("form.reapplyTitle")} - {t("form.manualAddSource")}
        </h2>
        <p className={styles.description}>
          {t("form.manualAddReapplyDescription")}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit, onSubmitError)}
          className={styles.form}
        >
          {/* Basic Information - 所有字段只读 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.domain")}</label>
                <Input
                  type="text"
                  value={domain || ""}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.folderName")}</label>
                <Input
                  type="text"
                  value={folderName || ""}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("form.email")}</label>
                <Input
                  type="email"
                  value={email || ""}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* SANs - 只读 */}
          <SANsController readOnly disabled />

          {/* Verification Options - 只读 */}
          <WebrootController disabled />

          {/* Force Renewal Option */}
          <ForceRenewalController />

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleEditClick}
              className={styles.editBtn}
            >
              {t("form.editCertificate")}
            </Button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isPending}
            >
              {isPending ? t("form.reapplying") : t("form.reapply")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ManualAddForm.displayName = "ManualAddForm";

export default ManualAddForm;

