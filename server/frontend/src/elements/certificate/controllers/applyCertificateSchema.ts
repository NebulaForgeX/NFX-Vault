import { z } from "zod";
import type { TFunction } from "i18next";

export type ApplyCertificateFormValues = z.input<ReturnType<typeof createApplyCertificateFormSchema>>;

export const createApplyCertificateFormSchema = (t: TFunction) => {
  return z.object({
    domain: z.string().trim().min(1, t("validation.domainRequired", { ns: "common" })),
    email: z.string().trim().email(t("validation.emailRequired", { ns: "common" })),
    folderName: z
      .string()
      .trim()
      .min(1, t("validation.folderNameRequired", { ns: "common" }))
      .regex(/^[a-zA-Z0-9_-]+$/, t("validation.folderNameInvalid", { ns: "common" })),
    sans: z
      .array(z.string().trim().min(1, t("validation.sansContentRequired", { ns: "common" })))
      .optional()
      .default([]),
    webroot: z.string().trim().optional(),
    forceRenewal: z.boolean().optional().default(false),
  });
};

