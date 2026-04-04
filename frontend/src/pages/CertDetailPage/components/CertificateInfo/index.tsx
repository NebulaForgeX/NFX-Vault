import { memo } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "@/assets/icons/lucide";
import type { CertificateDetailResponse } from "@/types";
import styles from "./styles.module.css";
import { safeArray } from "nfx-ui/utils";

interface CertificateInfoProps {
  certDetail: CertificateDetailResponse;
}

const CertificateInfo = memo(({ certDetail }: CertificateInfoProps) => {
  const { t } = useTranslation("certDetail");

  const sansList: string[] = safeArray<string>(certDetail.sans);
  const hasSans = sansList.length > 0;

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("certificate.info") || "Certificate Information"}</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>{t("certificate.domain") || "Domain"}</label>
            <span>{certDetail.domain}</span>
          </div>
          <div className={styles.infoItem}>
            <label>{t("certificate.email") || "Contact email"}</label>
            <span>{certDetail.email?.trim() ? certDetail.email : "—"}</span>
          </div>
          {certDetail.folderName && (
            <div className={styles.infoItem}>
              <label>{t("certificate.folderName") || "Folder Name"}</label>
              <span>{certDetail.folderName}</span>
            </div>
          )}
          {certDetail.status && (
            <div className={styles.infoItem}>
              <label>{t("certificate.status") || "Status"}</label>
              <span>{certDetail.status}</span>
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
          {certDetail.lastErrorMessage && (
            <div className={styles.errorSection}>
              <div className={styles.errorHeader}>
                <AlertCircle size={18} className={styles.errorIcon} />
                <label>{t("certificate.lastError") || "Last Error"}</label>
              </div>
              <div className={styles.errorContent}>
                <p className={styles.errorMessage}>{certDetail.lastErrorMessage}</p>
                {certDetail.lastErrorTime && (
                  <p className={styles.errorTime}>
                    {t("certificate.errorTime") || "Error Time"}: {new Date(certDetail.lastErrorTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {hasSans ? (
        <section className={styles.section} aria-labelledby="cert-detail-sans-heading">
          <h2 id="cert-detail-sans-heading" className={styles.sectionTitle}>
            {t("certificate.sans") || "Subject Alternative Names (SANs)"}
          </h2>
          <div className={styles.sansBlock}>
            <div className={styles.sansList}>
              {sansList.map((san, idx) => (
                <span key={idx} className={styles.sanTag}>
                  {san}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
});

CertificateInfo.displayName = "CertificateInfo";

export default CertificateInfo;
