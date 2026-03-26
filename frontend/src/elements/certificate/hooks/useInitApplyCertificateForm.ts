import type { CertificateFormValues } from "../schemas/certificateSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createApplyCertificateFormSchema } from "../schemas/certificateSchema";

export default function useInitApplyCertificateForm() {
  const { t } = useTranslation("common");
  const schema = createApplyCertificateFormSchema(t);

  return useForm<CertificateFormValues>({
    resolver: zodResolver(schema) as Resolver<CertificateFormValues>,
    mode: "onChange",
    defaultValues: {
      domain: "",
      folderName: "",
      email: "",
      issuer: "",
      certificate: "",
      privateKey: "",
      sans: [],
      webroot: "",
      forceRenewal: false,
    },
  });
}
