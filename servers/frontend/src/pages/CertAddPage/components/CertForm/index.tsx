import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "@/elements/certificate/controllers/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";

import {
  StoreController,
  DomainController,
  FolderNameController,
  IssuerController,
  CertificateController,
  PrivateKeyController,
} from "@/elements/certificate/components";
import EmailControllerForAdd from "@/elements/certificate/components/EmailControllerForAdd";

import styles from "./styles.module.css";

interface CertFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
  isEditMode?: boolean;
}

const CertForm = memo(({ onSubmit, onSubmitError, isPending, isEditMode = false }: CertFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<CertificateFormValues>();

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          {isEditMode ? (t("form.editTitle") || "编辑证书") : (t("form.create") || "创建新证书")}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={styles.form}
        >
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.basicInfo") || "基本信息"}</h3>
            <div className={styles.basicInfoGrid}>
              <div className={styles.leftColumn}>
                <StoreController />
                <DomainController />
                <FolderNameController />
                <EmailControllerForAdd />
                <IssuerController />
              </div>
            </div>
          </div>

          {/* Certificate Content */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.certificate") || "证书内容"}</h3>
            <CertificateController />
          </div>

          {/* Private Key */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t("form.privateKey") || "私钥内容"}</h3>
            <PrivateKeyController />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.submitBtn}
              disabled={isPending}
              onClick={methods.handleSubmit(onSubmit, onSubmitError)}
            >
              {isPending
                ? isEditMode
                  ? (t("form.updating") || "更新中...")
                  : (t("form.creating") || "创建中...")
                : isEditMode
                  ? (t("form.update") || "更新证书")
                  : (t("form.create") || "创建证书")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CertForm.displayName = "CertForm";

export default CertForm;

