import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateInfo } from "@/types";
import { CertificateStatus, CertificateSource } from "@/types";

export interface CertificateStatusInfo {
  label: string;
  bgColor: string;
  textColor: string;
}

export interface CertificateTimeInfo {
  label: string;
  bgColor: string;
  textColor: string;
}

export interface CertificateSourceInfo {
  label: string;
  bgColor: string;
  textColor: string;
}

/**
 * Hook to get certificate application status color (for border)
 * Uses theme CSS variables for consistency.
 */
export const useCertificateStatus = (cert: CertificateInfo | undefined): string => {
  const statusColor = useMemo(() => {
    if (!cert || !cert.status) {
      return "var(--color-fg)";
    }
    if (cert.status === CertificateStatus.SUCCESS) {
      return "var(--color-success)";
    }
    if (cert.status === CertificateStatus.FAIL) {
      return "var(--color-danger)";
    }
    return "var(--color-fg)";
  }, [cert]);
  return statusColor;
};

/**
 * Hook to get certificate time-based status display information (for valid/expired status)
 * @param cert - Certificate info object
 * @returns Time-based status display information including label, bgColor, and textColor
 */
export const useCertificateTime = (cert: CertificateInfo | undefined): CertificateTimeInfo => {
  const { t } = useTranslation("certCheck");

  const timeInfo = useMemo(() => {
    if (!cert) {
      return {
        label: t("status.valid"),
        bgColor: "var(--color-bg-4)",
        textColor: "var(--color-fg-text)",
      };
    }

    const isExpired = !cert.isValid || (cert.daysRemaining !== undefined && cert.daysRemaining <= 0);

    if (isExpired) {
      return {
        label: t("status.expired"),
        bgColor: "var(--color-danger)",
        textColor: "var(--color-primary-fg)",
      };
    }

    if (cert.daysRemaining !== undefined) {
      const days = cert.daysRemaining;

      if (days >= 0 && days < 7) {
        return {
          label: `${t("status.expiringSoon")} (${t("status.remainingDays", { days })})`,
          bgColor: "var(--color-warning)",
          textColor: "var(--color-primary-fg)",
        };
      }

      if (days >= 7) {
        return {
          label: `${t("status.valid")} (${t("status.remainingDays", { days })})`,
          bgColor: "var(--color-success)",
          textColor: "var(--color-primary-fg)",
        };
      }
    }

    return {
      label: t("status.valid"),
      bgColor: "var(--color-success)",
      textColor: "var(--color-primary-fg)",
    };
  }, [cert, t]);

  return timeInfo;
};

/**
 * Hook to get certificate source display information
 * @param source - Certificate source (auto, manual_apply, manual_add)
 * @returns Source display information including label, bgColor, and textColor
 */
export const useCertificateSource = (source?: CertificateSource | string): CertificateSourceInfo => {
  const { t } = useTranslation("certEdit");

  const sourceInfo = useMemo(() => {
    if (!source) {
      return {
        label: t("source.auto") || "Auto",
        bgColor: "var(--color-bg-4)",
        textColor: "var(--color-fg-text)",
      };
    }

    const sourceValue = source as CertificateSource;

    switch (sourceValue) {
      case CertificateSource.AUTO:
        return {
          label: t("source.auto") || "Auto",
          bgColor: "var(--color-info)",
          textColor: "var(--color-primary-fg)",
        };
      case CertificateSource.MANUAL_APPLY:
        return {
          label: t("source.manual_apply") || "Manual Apply",
          bgColor: "var(--color-success)",
          textColor: "var(--color-primary-fg)",
        };
      case CertificateSource.MANUAL_ADD:
        return {
          label: t("source.manual_add") || "Manual Add",
          bgColor: "var(--color-warning)",
          textColor: "var(--color-primary-fg)",
        };
      default:
        return {
          label: t("source.auto") || "Auto",
          bgColor: "var(--color-bg-4)",
          textColor: "var(--color-fg-text)",
        };
    }
  }, [source, t]);

  return sourceInfo;
};

/**
 * Hook to get countdown timer information until certificate expiration
 * @param notAfter - Certificate expiration date (ISO string)
 * @returns Countdown information including formatted time string and isExpired flag
 */
export const useCertificateCountdown = (notAfter?: string): { countdown: string; isExpired: boolean } => {
  const [countdown, setCountdown] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!notAfter) {
      setCountdown("");
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(notAfter).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown("00:00:00:00");
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatTime = (value: number) => value.toString().padStart(2, "0");
      setCountdown(`${formatTime(days)}:${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [notAfter]);

  return { countdown, isExpired };
};
