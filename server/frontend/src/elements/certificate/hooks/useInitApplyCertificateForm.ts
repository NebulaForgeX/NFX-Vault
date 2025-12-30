import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createApplyCertificateFormSchema } from "../controllers/applyCertificateSchema";

export default function useInitApplyCertificateForm() {
  const { t } = useTranslation("common");
  const schema = createApplyCertificateFormSchema(t);

  const form = useForm<ApplyCertificateFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      domain: "",
      email: "",
      sans: [],
      webroot: "",
    },
  });

  return form;
}

