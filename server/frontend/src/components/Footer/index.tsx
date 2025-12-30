import { memo } from "react";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.css";

interface FooterProps {
  className?: string;
}

const Footer = memo(({ className }: FooterProps) => {
  const { t } = useTranslation("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <div className={styles.footerContent}>
        <span className={styles.copyright}>© {currentYear} {t("footer.copyright")}</span>
        <div className={styles.links}>
          <a href="#" className={styles.link}>
            {t("footer.about")}
          </a>
          <a href="#" className={styles.link}>
            {t("footer.privacy")}
          </a>
          <a href="#" className={styles.link}>
            {t("footer.terms")}
          </a>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
