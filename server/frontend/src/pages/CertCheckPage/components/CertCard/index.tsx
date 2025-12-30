import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { CertType } from "@/apis/domain";
import type { CertificateInfo } from "@/apis/domain";
import { CertificateStatus } from "@/apis/domain";
import { Edit, Eye, Trash2, Loader2 } from "@/assets/icons/lucide";
import { useCertificateStatus, useCertificateTime } from "@/hooks";
import { useActionCertificateItem } from "../../hooks";
import styles from "./styles.module.css";

interface CertCardProps {
  cert: CertificateInfo;
  certType: CertType;
}

const CertCard = memo(({ cert, certType }: CertCardProps) => {
  const { t } = useTranslation("certCheck");
  const statusColor = useCertificateStatus(cert); // 用于边框颜色
  const timeInfo = useCertificateTime(cert); // 用于时间状态显示
  const { handleEdit, handleView, handleDelete } = useActionCertificateItem();

  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮区域，不触发卡片点击
    if ((e.target as HTMLElement).closest(`.${styles.certActions}`)) return;
    
    
    // 点击卡片本身，跳转到查看页面
    handleView(cert, certType)();
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
          handleView(cert, certType)();
        }
      }}
    >
      <div className={styles.certHeader}>
        <div className={styles.certInfo}>
          <h3 className={styles.certDomain}>{cert.domain}</h3>
          <p className={styles.certMeta}>
            {t("certificate.issuer")}: {cert.issuer || t("certificate.unknown")}
          </p>
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
                onClick={handleView(cert, certType)}
                title={t("actions.view") || "View"}
              >
                <Loader2 size={18} className={styles.rotating} />
              </button>
            )}
            <button
              className={styles.actionButton}
              onClick={handleEdit(cert, certType)}
              title={t("actions.update") || "Edit"}
            >
              <Edit size={18} />
            </button>
            <button
              className={styles.actionButton}
              onClick={handleView(cert, certType)}
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

