import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Download, Edit, Trash2, RefreshCw } from "@/assets/icons/lucide";
import { CertificateSource } from "@/apis/domain";
import { ROUTES } from "@/types/navigation";
import { showError, showConfirm } from "@/stores/modalStore";
import IconButton from "../IconButton";
import styles from "./styles.module.css";

interface CertificateOperationsProps {
  certDetail: {
    domain: string;
    source?: CertificateSource;
    email?: string;
  };
  certType: string;
  source: CertificateSource;
  onDownloadCertificate: () => void;
  onDownloadPrivateKey: () => void;
  onExportBoth: () => void;
  onDelete: () => void;
  onReapply?: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isReapplying?: boolean;
}

const CertificateOperations = memo(({
  certDetail,
  certType,
  source,
  onDownloadCertificate,
  onDownloadPrivateKey,
  onExportBoth,
  onDelete,
  onReapply,
  isUpdating,
  isDeleting,
  isReapplying = false,
}: CertificateOperationsProps) => {
  const { t } = useTranslation("cert");
  const navigate = useNavigate();

  const handleUpdate = () => {
    // 如果是 AUTO 源的证书，不允许编辑
    if (source === CertificateSource.AUTO) {
      showError(t("update.autoNotEditable") || "Auto source certificates cannot be manually updated. Please re-apply instead.");
      return;
    }
    // 导航到编辑页面
    navigate(ROUTES.CERT_EDIT_PATH(certType, certDetail.domain, source));
  };

  const handleReapply = () => {
    if (!onReapply) return;
    
    showConfirm({
      title: t("reapply.title") || "Re-apply Certificate",
      message: (t("reapply.confirm") || `Are you sure you want to re-apply certificate for "${certDetail.domain}"?`).replace("{{domain}}", certDetail.domain),
      confirmText: t("actions.reapply") || "Re-apply",
      cancelText: t("delete.confirm.cancel") || "Cancel",
      onConfirm: onReapply,
    });
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("actions.operations") || "Operations"}</h2>
      <div className={styles.buttonGroup}>
        <IconButton onClick={onDownloadCertificate} variant="primary" icon={<Download size={16} />}>
          {t("download.certificate") || "Download Certificate"}
        </IconButton>
        <IconButton onClick={onDownloadPrivateKey} variant="primary" icon={<Download size={16} />}>
          {t("download.privateKey") || "Download Private Key"}
        </IconButton>
        <IconButton onClick={onExportBoth} variant="secondary" icon={<Download size={16} />}>
          {t("download.both") || "Download Both"}
        </IconButton>
        <IconButton
          onClick={handleUpdate}
          variant="secondary"
          icon={<Edit size={16} />}
          disabled={isUpdating || source === CertificateSource.AUTO}
          title={source === CertificateSource.AUTO ? (t("update.autoNotEditable") || "Auto certificates cannot be edited") : undefined}
        >
          {t("actions.update") || "Update"}
        </IconButton>
        {onReapply && (
          <IconButton
            onClick={handleReapply}
            variant="secondary"
            icon={<RefreshCw size={16} />}
            disabled={isReapplying}
            title={t("actions.reapply") || "Re-apply Certificate"}
          >
            {isReapplying ? (t("apply.applying") || "Applying...") : (t("actions.reapply") || "Re-apply")}
          </IconButton>
        )}
        <IconButton
          onClick={onDelete}
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

