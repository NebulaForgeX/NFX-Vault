import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock } from "@/assets/icons/lucide";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { useCertificateTime, useCertificateCountdown } from "@/hooks";
import type { CertificateDetailResponse } from "@/types";
import styles from "./styles.module.css";

interface CertDetailHeaderProps {
  certDetail: CertificateDetailResponse;
}

const CertDetailHeader = memo(({ certDetail }: CertDetailHeaderProps) => {
  const { t } = useTranslation("certDetail");
  const timeInfo = useCertificateTime(certDetail);
  const { countdown, isExpired } = useCertificateCountdown(certDetail.notAfter);

  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={() => routerEventEmitter.navigate({ to: ROUTES.CHECK })}>
        <ArrowLeft size={20} />
        <span>{t("back") || "Back"}</span>
      </button>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{certDetail.domain}</h1>
        <div className={styles.badges}>
          <div className={styles.statusBadge} style={{ backgroundColor: timeInfo.bgColor, color: timeInfo.textColor }}>
            {timeInfo.label}
          </div>
          {certDetail.notAfter && countdown && (
            <div
              className={`${styles.countdownBadge} ${isExpired ? styles.expired : ""}`}
              style={{
                backgroundColor: isExpired ? "#ef4444" : "#3b82f6",
                color: "#ffffff",
              }}
            >
              <Clock size={14} className={styles.countdownIcon} />
              <span className={styles.countdownText}>{countdown}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CertDetailHeader.displayName = "CertDetailHeader";

export default CertDetailHeader;

