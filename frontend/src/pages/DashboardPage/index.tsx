import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "@/navigations";
import styles from "./styles.module.css";

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { t: tNav } = useTranslation("navigation");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <img src="/logo.png" alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>{t("title")}</h1>
        </div>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("certManagement.title")}</h2>
            <p className={styles.cardDescription}>{t("certManagement.description")}</p>
            <Link to={ROUTES.CHECK} className={styles.cardLink}>
              {t("certManagement.action")}
            </Link>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("quickCheck.title")}</h2>
            <p className={styles.cardDescription}>{t("quickCheck.description")}</p>
            <Link to={ROUTES.CHECK} className={styles.cardLink}>
              {t("quickCheck.action")}
            </Link>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t("certAdd.title") || "Add certificate"}</h2>
            <p className={styles.cardDescription}>{t("certAdd.subtitle") || "Manual entry or upload PEM"}</p>
            <Link to={ROUTES.CERT_ADD} className={styles.cardLink}>
              {tNav("addCert")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
