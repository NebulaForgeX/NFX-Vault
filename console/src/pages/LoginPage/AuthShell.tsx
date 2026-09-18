import type { ReactNode } from "react";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Box } from "@radix-ui/themes";
import gsap from "gsap";
import { PreferencesPopover } from "nfx-ui/components";

import styles from "./AuthShell.module.css";

gsap.registerPlugin(useGSAP);

export type AuthShellProps = {
  brandTitle: string;
  brandEyebrow?: string;
  heroFooter: string;
  children: ReactNode;
};

export default function AuthShell({ brandTitle, brandEyebrow, heroFooter, children }: AuthShellProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(".js-crop", { autoAlpha: 0, scale: 0.4 });
      gsap.set(".js-cert", { autoAlpha: 0, y: 20 });
      gsap.set(".js-seal", { autoAlpha: 0 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".js-crop", { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.06 })
        .to(".js-cert", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.2")
        .to(".js-seal", { autoAlpha: 1, duration: 0.4 }, "-=0.2");
    },
    { scope: pageRef },
  );

  return (
    <Box ref={pageRef} className={styles.page} asChild>
      <main className={styles.frame}>
        <div className={styles.toolbar}>
          <PreferencesPopover />
        </div>
        <section className={`${styles.cert} js-cert`}>
          <span className={`${styles.crop} ${styles.cropTl} js-crop`} aria-hidden />
          <span className={`${styles.crop} ${styles.cropTr} js-crop`} aria-hidden />
          <span className={`${styles.crop} ${styles.cropBl} js-crop`} aria-hidden />
          <span className={`${styles.crop} ${styles.cropBr} js-crop`} aria-hidden />
          <div className={styles.meta}>
            <span>{brandEyebrow ?? "NFX Vault"}</span>
            <span>TLS REQUEST · CA-01</span>
          </div>
          <h1 className={styles.title}>{brandTitle}</h1>
          <p className={styles.lede}>{heroFooter}</p>
          <div className={styles.form}>{children}</div>
          <p className={`${styles.seal} js-seal`}>Each account holds its own domains. Public names stay unique on the edge.</p>
        </section>
      </main>
    </Box>
  );
}
