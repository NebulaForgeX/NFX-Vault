import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";
import type { CertificateDetailResponse } from "@/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { createApplyCertificateFormSchema } from "../controllers/applyCertificateSchema";

export default function useInitApplyCertificateForm(certificate?: CertificateDetailResponse | null) {
  const { t } = useTranslation("common");
  const schema = createApplyCertificateFormSchema(t);

  const form = useForm<ApplyCertificateFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      domain: certificate?.domain || "",
      email: certificate?.email || "",
      folderName: certificate?.folderName || "",
      sans: certificate?.sans || [],
      webroot: "",
    },
  });

  // 当证书数据加载后，更新表单值
  useEffect(() => {
    if (certificate) {
      form.reset({
        domain: certificate.domain || "",
        email: certificate.email || "",
        folderName: certificate.folderName || "",
        sans: certificate.sans || [],
        webroot: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate]);

  return form;
}

