import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateInfo } from "@/types";
import { CertificateStatus } from "@/types";

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

export const useCertificateListAccent = (cert: CertificateInfo | undefined): string => {
  return useMemo(() => {
    if (!cert) {
      return "var(--color-border-4)";
    }
    if (cert.status === CertificateStatus.FAIL) {
      return "var(--color-danger)";
    }
    if (cert.status === CertificateStatus.PROCESS) {
      return "var(--color-primary)";
    }
    const isExpired = !cert.isValid || (cert.daysRemaining !== undefined && cert.daysRemaining <= 0);
    if (isExpired) {
      return "var(--color-danger)";
    }
    if (cert.daysRemaining !== undefined) {
      const days = cert.daysRemaining;
      if (days >= 0 && days < 7) {
        return "var(--color-warning)";
      }
      if (days >= 7) {
        return "var(--color-primary)";
      }
    }
    return "var(--color-primary)";
  }, [cert]);
};

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
        bgColor: "var(--color-danger-light)",
        textColor: "var(--color-danger)",
      };
    }

    if (cert.daysRemaining !== undefined) {
      const days = cert.daysRemaining;

      if (days >= 0 && days < 7) {
        return {
          label: `${t("status.expiringSoon")} (${t("status.remainingDays", { days })})`,
          bgColor: "var(--color-warning-light)",
          textColor: "var(--color-warning)",
        };
      }

      if (days >= 7) {
        return {
          label: `${t("status.valid")} (${t("status.remainingDays", { days })})`,
          bgColor: "color-mix(in srgb, var(--color-primary) 16%, var(--color-bg-2))",
          textColor: "var(--color-primary)",
        };
      }
    }

    return {
      label: t("status.valid"),
      bgColor: "color-mix(in srgb, var(--color-primary) 16%, var(--color-bg-2))",
      textColor: "var(--color-primary)",
    };
  }, [cert, t]);

  return timeInfo;
};

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
