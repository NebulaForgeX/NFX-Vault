import type { CertificateFormValues } from "../controllers/certificateSchema";
import type { CertificateDetailResponse } from "@/apis/domain";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CertificateFormSchema } from "../controllers/certificateSchema";

export default function useInitCertificateForm(certificate?: CertificateDetailResponse | null) {
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(CertificateFormSchema),
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
          folder_name: "",
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
        folder_name: certificate.folder_name || "",
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

