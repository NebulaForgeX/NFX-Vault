import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, RefreshCw } from "@/assets/icons/lucide";
import { CertificateSource } from "@/apis/domain";
import { IconButton } from "@/components";
import { useOperationCertificate } from "../../hooks";
import type { CertType } from "@/types";
import styles from "./styles.module.css";

interface CertificateOperationsProps {
  domain: string;
  source: CertificateSource;
  certType: CertType;
}

const CertificateOperations = memo(({
  domain,
  source,
  certType,
}: CertificateOperationsProps) => {
  const { t } = useTranslation("certDetail");
  const { handleUpdate, handleReapply, handleDelete, isDeleting, isReapplying } = useOperationCertificate({
    domain,
    source,
    certType,
  });

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("actions.operations") || "Operations"}</h2>
      <div className={styles.buttonGroup}>
        <IconButton
          onClick={handleUpdate}
          variant="secondary"
          icon={<Edit size={16} />}
          disabled={source === CertificateSource.AUTO}
          title={source === CertificateSource.AUTO ? (t("update.autoNotEditable") || "Auto certificates cannot be edited") : undefined}
        >
          {t("actions.update") || "Update"}
        </IconButton>
        <IconButton
          onClick={handleReapply}
          variant="secondary"
          icon={<RefreshCw size={16} />}
          disabled={isReapplying}
          title={t("actions.reapply") || "Re-apply Certificate"}
        >
          {isReapplying ? (t("reapply.applying") || "重新申请中...") : (t("actions.reapply") || "重新申请")}
        </IconButton>
        <IconButton
          onClick={handleDelete}
          variant="secondary"
          icon={<Trash2 size={16} />}
          disabled={isDeleting}
          style={{ color: "var(--color-danger)" }}
        >
          {isDeleting ? t("delete.deleting") || "Deleting..." : t("actions.delete") || "Delete"}
        </IconButton>
      </div>
    </div>
  );
});

CertificateOperations.displayName = "CertificateOperations";

export default CertificateOperations;

