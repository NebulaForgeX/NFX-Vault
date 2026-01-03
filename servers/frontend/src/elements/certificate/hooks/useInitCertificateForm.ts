import type { CertificateFormValues } from "../controllers/certificateSchema";
import type { CertificateDetailResponse } from "@/apis/domain";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "node_modules/react-i18next";

import { createCertificateFormSchema } from "../controllers/certificateSchema";

export default function useInitCertificateForm(certificate?: CertificateDetailResponse | null) {
  const { t } = useTranslation("common");
  const schema = createCertificateFormSchema(t);

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: certificate
      ? {
          store: (certificate.store as "websites" | "apis") || "websites",
          domain: certificate.domain,
          certificate: certificate.certificate,
          privateKey: certificate.privateKey,
          sans: certificate.sans || [],
        }
      : {
          store: "database",
          domain: "",
          folderName: "",
          email: "",
          issuer: "",
          certificate: "",
          privateKey: "",
          sans: [],
        },
  });

  useEffect(() => {
    if (certificate) {
      form.reset({
        store: (certificate.store as "websites" | "apis" | "database") || "database",
        domain: certificate.domain,
        folderName: certificate.folderName || "", // axios-case-converter 将 folder_name 转换为 folderName
        email: certificate.email || "",
        issuer: certificate.issuer || "",
        certificate: certificate.certificate,
        privateKey: certificate.privateKey,
        sans: certificate.sans || [],
      });
    }
  }, [certificate, form]);

  return form;
}

