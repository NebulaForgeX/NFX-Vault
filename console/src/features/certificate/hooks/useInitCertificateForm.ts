import type { EditCertificateFormValues } from "../schemas/certificateSchema";
import type { CertificateDetailResponse } from "@/types";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { safeArray, safeStringable } from "nfx-ui/utils";

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
          sans: safeArray(certificate.sans),
          folderName: safeStringable(certificate.folderName),
          email: safeStringable(certificate.email),
          issuer: safeStringable(certificate.issuer),
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

  // 仅在 certificateId 变化时灌表（含首次加载）；避免详情 refetch 冲掉用户正在编辑的 folderName
  const certificateId = certificate?.id;
  useEffect(() => {
    if (!certificate || !certificateId) return;
    form.reset({
      domain: certificate.domain,
      folderName: safeStringable(certificate.folderName),
      email: safeStringable(certificate.email),
      issuer: safeStringable(certificate.issuer),
      sans: safeArray(certificate.sans),
      webroot: "",
      forceRenewal: false,
    });
  }, [certificateId, form]);

  return form;
}
