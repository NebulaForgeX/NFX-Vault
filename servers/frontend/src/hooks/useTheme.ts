import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateInfo } from "@/apis/domain";
import { CertificateStatus, CertificateSource } from "@/apis/domain";

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
 * @param cert - Certificate info object
 * @returns Status color: green (success), red (fail), gray (other)
 */
export const useCertificateStatus = (cert: CertificateInfo | undefined): string => {
  const statusColor = useMemo(() => {
    if (!cert || !cert.status) {
      return "#6b7280"; // Gray - 其他
    }

    if (cert.status === CertificateStatus.SUCCESS) {
      return "#10b981"; // Green - success
    }

    if (cert.status === CertificateStatus.FAIL) {
      return "#ef4444"; // Red - fail
    }

    return "#6b7280"; // Gray - 其他
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
        bgColor: "#6b7280", // Cool Gray
        textColor: "#ffffff",
      };
    }

    // 判断证书状态
    const isExpired = !cert.isValid || (cert.daysRemaining !== undefined && cert.daysRemaining <= 0);
    
    if (isExpired) {
      return {
        label: t("status.expired"),
        bgColor: "#ef4444", // Rose Red
        textColor: "#ffffff",
      };
    }

    // 检查是否有剩余天数信息
    if (cert.daysRemaining !== undefined) {
      const days = cert.daysRemaining;
      
      // 即将过期：0-6天
      if (days >= 0 && days < 7) {
        return {
          label: `${t("status.expiringSoon")} (${t("status.remainingDays", { days })})`,
          bgColor: "#f59e0b", // Amber Orange
          textColor: "#ffffff",
        };
      }
      
      // 有效且剩余天数 >= 7
      if (days >= 7) {
        return {
          label: `${t("status.valid")} (${t("status.remainingDays", { days })})`,
          bgColor: "#10b981", // Emerald Green
          textColor: "#ffffff",
        };
      }
    }

    // 默认：有效但没有天数信息
    return {
      label: t("status.valid"),
      bgColor: "#10b981", // Emerald Green
      textColor: "#ffffff",
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
        bgColor: "#6b7280", // Gray
        textColor: "#ffffff",
      };
    }

    const sourceValue = source as CertificateSource;

    switch (sourceValue) {
      case CertificateSource.AUTO:
        return {
          label: t("source.auto") || "Auto",
          bgColor: "#3b82f6", // Blue
          textColor: "#ffffff",
        };
      case CertificateSource.MANUAL_APPLY:
        return {
          label: t("source.manual_apply") || "Manual Apply",
          bgColor: "#10b981", // Green
          textColor: "#ffffff",
        };
      case CertificateSource.MANUAL_ADD:
        return {
          label: t("source.manual_add") || "Manual Add",
          bgColor: "#f59e0b", // Amber
          textColor: "#ffffff",
        };
      default:
        return {
          label: t("source.auto") || "Auto",
          bgColor: "#6b7280", // Gray
          textColor: "#ffffff",
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

    // 立即更新一次
    updateCountdown();

    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [notAfter]);

  return { countdown, isExpired };
};

