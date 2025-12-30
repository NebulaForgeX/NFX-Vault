import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "@/assets/icons/lucide";
import { ROUTES } from "@/types/navigation";
import { useCertificateTime } from "@/hooks";
import type { CertificateDetailResponse } from "@/apis/domain";
import styles from "./styles.module.css";

interface CertDetailHeaderProps {
  certDetail: CertificateDetailResponse;
}

const CertDetailHeader = memo(({ certDetail }: CertDetailHeaderProps) => {
  const { t } = useTranslation("cert");
  const navigate = useNavigate();
  const timeInfo = useCertificateTime(certDetail);

  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={() => navigate(ROUTES.CHECK)}>
        <ArrowLeft size={20} />
        <span>{t("back") || "Back"}</span>
      </button>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{certDetail.domain}</h1>
        <div className={styles.statusBadge} style={{ backgroundColor: timeInfo.bgColor, color: timeInfo.textColor }}>
          {timeInfo.label}
        </div>
      </div>
    </div>
  );
});

CertDetailHeader.displayName = "CertDetailHeader";

export default CertDetailHeader;

