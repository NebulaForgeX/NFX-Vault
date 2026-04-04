import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Edit, RefreshCw, Trash2 } from "@/assets/icons/lucide";
import { IconButton } from "@/components";
import { useOperationCertificate } from "../../hooks";
import styles from "./styles.module.css";

interface CertificateOperationsProps {
  certificateId: string;
}

const CertificateOperations = memo(({ certificateId }: CertificateOperationsProps) => {
  const { t } = useTranslation("certDetail");
  const { handleEdit, handleReapply, handleDelete, isDeleting, isReapplying } = useOperationCertificate(certificateId);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("actions.operations") || "Operations"}</h2>
      <div className={styles.buttonGroup}>
        <IconButton onClick={handleEdit} variant="secondary" icon={<Edit size={16} />}>
          {t("actions.update") || "Update"}
        </IconButton>
        <IconButton
          onClick={handleReapply}
          variant="secondary"
          icon={<RefreshCw size={16} />}
          disabled={isReapplying}
        >
          {isReapplying ? t("reapply.applying") : t("actions.reapply")}
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
