import type { EditCertificateFormValues } from "../schemas/certificateSchema";
import type { CertificateDetailResponse } from "@/types";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createEditCertificateFormSchema } from "../schemas/certificateSchema";

export default function useInitCertificateForm(certificate?: CertificateDetailResponse | null) {
  const { t } = useTranslation("common");
  const schema = createEditCertificateFormSchema(t);

  const form = useForm<EditCertificateFormValues>({
    resolver: zodResolver(schema) as Resolver<EditCertificateFormValues>,
    mode: "onChange",
    defaultValues: certificate
      ? {
          domain: certificate.domain,
          sans: certificate.sans || [],
          folderName: certificate.folderName || "",
          email: certificate.email || "",
          issuer: certificate.issuer || "",
          webroot: "",
          forceRenewal: false,
        }
      : {
          domain: "",
          folderName: "",
          email: "",
          issuer: "",
          sans: [],
          webroot: "",
          forceRenewal: false,
        },
  });

  useEffect(() => {
    if (certificate) {
      form.reset({
        domain: certificate.domain,
        folderName: certificate.folderName || "",
        email: certificate.email || "",
        issuer: certificate.issuer || "",
        sans: certificate.sans || [],
        webroot: "",
        forceRenewal: false,
      });
    }
  }, [certificate, form]);

  return form;
}
