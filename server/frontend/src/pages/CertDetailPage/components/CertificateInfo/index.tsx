import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateDetailResponse } from "@/apis/domain";
import { useCertificateSource } from "@/hooks";
import styles from "./styles.module.css";

interface CertificateInfoProps {
  certDetail: CertificateDetailResponse;
}

const CertificateInfo = memo(({ certDetail }: CertificateInfoProps) => {
  const { t } = useTranslation("certDetail");
  const sourceInfo = useCertificateSource(certDetail.source);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("certificate.info") || "Certificate Information"}</h2>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <label>{t("certificate.domain") || "Domain"}</label>
          <span>{certDetail.domain}</span>
        </div>
        {certDetail.source && (
          <div className={styles.infoItem}>
            <label>{t("certificate.source") || "Source"}</label>
            <span
              className={styles.sourceBadge}
              style={{ backgroundColor: sourceInfo.bgColor, color: sourceInfo.textColor }}
            >
              {sourceInfo.label}
            </span>
          </div>
        )}
        <div className={styles.infoItem}>
          <label>{t("certificate.issuer") || "Issuer"}</label>
          <span>{certDetail.issuer || t("certificate.unknown") || "Unknown"}</span>
        </div>
        {certDetail.notBefore && (
          <div className={styles.infoItem}>
            <label>{t("certificate.validFrom") || "Valid From"}</label>
            <span>{new Date(certDetail.notBefore).toLocaleString()}</span>
          </div>
        )}
        {certDetail.notAfter && (
          <div className={styles.infoItem}>
            <label>{t("certificate.expiryDate") || "Expiry Date"}</label>
            <span>{new Date(certDetail.notAfter).toLocaleString()}</span>
          </div>
        )}
        {certDetail.sans && certDetail.sans.length > 0 && (
          <div className={styles.infoItem}>
            <label>{t("certificate.sans") || "Subject Alternative Names (SANs)"}</label>
            <div className={styles.sansList}>
              {certDetail.sans.map((san, idx) => (
                <span key={idx} className={styles.sanTag}>{san}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CertificateInfo.displayName = "CertificateInfo";

export default CertificateInfo;

