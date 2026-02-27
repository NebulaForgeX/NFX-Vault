import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateInfo } from "@/types";
import { CertificateStatus } from "@/types";
import { Edit, Eye, Trash2, Loader2, AlertTriangle } from "@/assets/icons/lucide";
import { useCertificateStatus, useCertificateTime, useCertificateSource } from "@/hooks";
import { useActionCertificateItem } from "../../hooks";
import { showTooltipModal, hideTooltipModal } from "@/stores/modalStore";
import styles from "./styles.module.css";

interface CertCardProps {
  cert: CertificateInfo;
}

const CertCard = memo(({ cert }: CertCardProps) => {
  const { t } = useTranslation("certCheck");
  const statusColor = useCertificateStatus(cert); // 用于边框颜色
  const timeInfo = useCertificateTime(cert); // 用于时间状态显示
  const sourceInfo = useCertificateSource(cert.source); // 用于来源显示
  const { handleEdit, handleView, handleDelete } = useActionCertificateItem();

  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮区域，不触发卡片点击
    if ((e.target as HTMLElement).closest(`.${styles.certActions}`)) return;
    
    
    // 点击卡片本身，跳转到查看页面
    handleView(cert)();
  };

  const handleErrorHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (cert.lastErrorMessage) {
      const rect = e.currentTarget.getBoundingClientRect();
      showTooltipModal({
        message: cert.lastErrorMessage,
        errorTime: cert.lastErrorTime,
        position: {
          x: rect.left,
          y: rect.bottom,
        },
      });
    }
  };

  const handleErrorLeave = () => {
    hideTooltipModal();
  };

  return (
    <div
      className={styles.certCard}
      style={{ borderColor: statusColor }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleView(cert)();
        }
      }}
    >
      <div className={styles.certHeader}>
        <div className={styles.certInfo}>
          <h3 className={styles.certDomain}>{cert.domain}</h3>
          {cert.source && (
            <div
              className={styles.certSource}
              style={{ backgroundColor: sourceInfo.bgColor, color: sourceInfo.textColor }}
            >
              {sourceInfo.label}
            </div>
          )}
          <p className={styles.certMeta}>
            {t("certificate.issuer")}: {cert.issuer || t("certificate.unknown")}
          </p>
          {cert.sans && cert.sans.length > 0 && (
            <p className={styles.certMeta}>
              {t("certificate.sans") || "SANs"}: {cert.sans.join(", ")}
            </p>
          )}
          {cert.notAfter && (
            <p className={styles.certMeta}>
              {t("certificate.expiryDate")}: {new Date(cert.notAfter).toLocaleString()}
            </p>
          )}
        </div>
        <div className={styles.certHeaderRight}>
          <div
            className={styles.certStatus}
            style={{ backgroundColor: timeInfo.bgColor, color: timeInfo.textColor }}
          >
            {timeInfo.label}
          </div>
          <div className={styles.certActions} onClick={(e) => e.stopPropagation()}>
            {cert.status === CertificateStatus.PROCESS && (
              <button
                className={`${styles.actionButton} ${styles.processButton}`}
                onClick={handleView(cert)}
                title={t("actions.view") || "View"}
              >
                <Loader2 size={18} className={styles.rotating} />
              </button>
            )}
            {cert.lastErrorMessage && (
              <button
                className={`${styles.actionButton} ${styles.errorButton}`}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={handleErrorHover}
                onMouseLeave={handleErrorLeave}
                title={t("certificate.lastError") || "Last Error"}
              >
                <AlertTriangle size={18} />
              </button>
            )}
            <button
              className={styles.actionButton}
              onClick={handleEdit(cert)}
              title={t("actions.update") || "Edit"}
            >
              <Edit size={18} />
            </button>
            <button
              className={styles.actionButton}
              onClick={handleView(cert)}
              title={t("actions.view") || "View"}
            >
              <Eye size={18} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDelete(cert)}
              title={t("actions.delete") || "Delete"}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CertCard.displayName = "CertCard";

export default CertCard;

