import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Layers } from "@/assets/icons/lucide";
import { safeArray } from "nfx-ui/utils";

import styles from "./styles.module.css";

export interface CertificateSansSectionProps {
  sans?: string[] | null;
}

const CertificateSansSection = memo(({ sans }: CertificateSansSectionProps) => {
  const { t } = useTranslation("certDetail");
  const list: string[] = (safeArray(sans))
    .map((item: unknown) => String(item).trim())
    .filter((n: string) => n.length > 0);

  if (list.length === 0) return null;

  return (
    <section className={styles.root} aria-labelledby="cert-sans-heading">
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.iconWrap} aria-hidden>
            <Layers size={20} strokeWidth={2} />
          </span>
          <div className={styles.headerText}>
            <h2 id="cert-sans-heading" className={styles.title}>
              {t("certificate.sans") || "Subject Alternative Names (SANs)"}
            </h2>
            <p className={styles.subtitle}>{t("certificate.sansSectionSubtitle")}</p>
          </div>
        </div>
        <span className={styles.countBadge} title={t("certificate.sansCountTitle", { count: list.length })}>
          {list.length}
        </span>
      </header>

      <ul className={styles.list}>
        {list.map((name, i) => (
          <li key={`${name}:${i}`} className={styles.item}>
            <span className={styles.itemIndex} aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <code className={styles.itemName}>{name}</code>
          </li>
        ))}
      </ul>
    </section>
  );
});

CertificateSansSection.displayName = "CertificateSansSection";

export default CertificateSansSection;
