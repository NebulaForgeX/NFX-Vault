import { memo } from "react";
import { useTranslation } from "react-i18next";
import { CertificateSource } from "@/apis/domain";
import type { CertificateDetailResponse } from "@/apis/domain";
import styles from "./styles.module.css";

interface CertificateInfoProps {
  certDetail: CertificateDetailResponse;
}

const CertificateInfo = memo(({ certDetail }: CertificateInfoProps) => {
  const { t } = useTranslation("cert");

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
            <span>
              {certDetail.source === CertificateSource.AUTO
                ? t("certificate.source.auto") || "Auto"
                : t("certificate.source.manual") || "Manual"}
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
      </div>
    </div>
  );
});

CertificateInfo.displayName = "CertificateInfo";

export default CertificateInfo;

