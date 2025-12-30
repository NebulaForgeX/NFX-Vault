import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ApplyCertificateFormSchema } from "../controllers/applyCertificateSchema";

export default function useInitApplyCertificateForm() {
  const form = useForm<ApplyCertificateFormValues>({
    resolver: zodResolver(ApplyCertificateFormSchema),
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

