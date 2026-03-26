import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "nfx-ui/components";
import type { CertificateInfo } from "@/types";
import { CertificateStatus } from "@/types";
import { Edit, Eye, Trash2, Loader2, AlertTriangle } from "@/assets/icons/lucide";
import { useCertificateListAccent, useCertificateTime } from "@/hooks";
import { useActionCertificateItem } from "../../hooks";
import { showTooltipModal } from "@/stores/modalStore";
import styles from "./styles.module.css";

interface CertCardProps {
  cert: CertificateInfo;
}

const CertCard = memo(({ cert }: CertCardProps) => {
  const { t } = useTranslation("certCheck");
  const accentColor = useCertificateListAccent(cert);
  const timeInfo = useCertificateTime(cert);
  const { handleEdit, handleView, handleDelete } = useActionCertificateItem();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.certActions}`)) return;
    handleView(cert)();
  };

  const handleErrorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (cert.lastErrorMessage) {
      showTooltipModal({
        message: cert.lastErrorMessage,
        errorTime: cert.lastErrorTime ?? undefined,
        position: {
          x: window.innerWidth / 2 - 175,
          y: window.innerHeight / 2 - 120,
        },
      });
    }
  };

  return (
    <article
      className={styles.certCard}
      style={{ borderLeftColor: accentColor }}
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
      <div className={styles.cardInner}>
        <header className={styles.topRow}>
          <div className={styles.titleBlock}>
            <h3 className={styles.certDomain}>{cert.domain}</h3>
          </div>
          <div
            className={styles.statusPill}
            style={{ backgroundColor: timeInfo.bgColor, color: timeInfo.textColor }}
          >
            {timeInfo.label}
          </div>
        </header>

        <dl className={styles.metaGrid}>
          <div className={styles.metaCell}>
            <dt>{t("certificate.issuer")}</dt>
            <dd>{cert.issuer || t("certificate.unknown")}</dd>
          </div>
          {cert.notAfter && (
            <div className={styles.metaCell}>
              <dt>{t("certificate.expiryDate")}</dt>
              <dd>{new Date(cert.notAfter).toLocaleString()}</dd>
            </div>
          )}
          {cert.sans && cert.sans.length > 0 && (
            <div className={`${styles.metaCell} ${styles.metaWide}`}>
              <dt>{t("certificate.sans") || "SANs"}</dt>
              <dd title={cert.sans.join(", ")}>{cert.sans.join(", ")}</dd>
            </div>
          )}
        </dl>

        <footer className={styles.certActions} onClick={(e) => e.stopPropagation()}>
          {cert.status === CertificateStatus.PROCESS && (
            <Button
              type="button"
              variant="ghost"
              size="small"
              iconOnly
              leftIcon={<Loader2 size={17} className={styles.rotating} />}
              onClick={handleView(cert)}
              title={t("actions.view") || "View"}
              aria-label={t("actions.view") || "View"}
              className={styles.toolBtn}
            />
          )}
          {cert.lastErrorMessage && (
            <Button
              type="button"
              variant="ghost"
              size="small"
              iconOnly
              leftIcon={<AlertTriangle size={17} />}
              onClick={handleErrorClick}
              title={t("certificate.lastError") || "Last Error"}
              aria-label={t("certificate.lastError") || "Last Error"}
              className={`${styles.toolBtn} ${styles.toolBtnWarning}`}
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="small"
            iconOnly
            leftIcon={<Edit size={17} />}
            onClick={handleEdit(cert)}
            title={t("actions.update") || "Edit"}
            aria-label={t("actions.update") || "Edit"}
            className={styles.toolBtn}
          />
          <Button
            type="button"
            variant="ghost"
            size="small"
            iconOnly
            leftIcon={<Eye size={17} />}
            onClick={handleView(cert)}
            title={t("actions.view") || "View"}
            aria-label={t("actions.view") || "View"}
            className={styles.toolBtn}
          />
          <Button
            type="button"
            variant="ghost"
            size="small"
            iconOnly
            leftIcon={<Trash2 size={17} />}
            onClick={handleDelete(cert)}
            title={t("actions.delete") || "Delete"}
            aria-label={t("actions.delete") || "Delete"}
            className={`${styles.toolBtn} ${styles.toolBtnDanger}`}
          />
        </footer>
      </div>
    </article>
  );
});

CertCard.displayName = "CertCard";

export default CertCard;
