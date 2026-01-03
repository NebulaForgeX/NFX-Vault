import { useCallback } from "react";
import { useTranslation } from "node_modules/react-i18next";
import { showSuccess } from "@/stores/modalStore";

interface UseDownloadCertificateProps {
  certificate: string;
  privateKey: string;
  domain: string;
}

export const useDownloadCertificate = ({ certificate, privateKey, domain }: UseDownloadCertificateProps) => {
  const { t } = useTranslation("certDetail");

  const downloadCertificate = useCallback(() => {
    const blob = new Blob([certificate], { type: "application/x-x509-ca-cert" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${domain}.crt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(t("download.success") || "Certificate downloaded");
  }, [certificate, domain, t]);

  const downloadPrivateKey = useCallback(() => {
    const blob = new Blob([privateKey], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${domain}.key`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(t("download.success") || "Private key downloaded");
  }, [privateKey, domain, t]);

  const downloadBoth = useCallback(() => {
    downloadCertificate();
    setTimeout(() => {
      downloadPrivateKey();
    }, 200);
  }, [downloadCertificate, downloadPrivateKey]);

  return {
    downloadCertificate,
    downloadPrivateKey,
    downloadBoth,
  };
};

export default useDownloadCertificate;

