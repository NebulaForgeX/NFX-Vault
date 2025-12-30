import { z } from "zod";
import type { TFunction } from "i18next";

export type CertificateFormValues = z.input<ReturnType<typeof createCertificateFormSchema>>;

export const createCertificateFormSchema = (t: TFunction) => {
  return z.object({
    store: z.enum(["websites", "apis", "database"]),
    domain: z.string().trim().min(1, t("validation.domainRequired", { ns: "common" })),
    folderName: z
      .string()
      .trim()
      .min(1, t("validation.folderNameRequired", { ns: "common" }))
      .regex(/^[a-zA-Z0-9_-]+$/, t("validation.folderNameInvalid", { ns: "common" }))
      .optional(),
    email: z.string().trim().email(t("validation.emailRequired", { ns: "common" })).optional(),
    issuer: z.string().trim().optional(),
    certificate: z.string().trim().min(1, t("validation.certificateRequired", { ns: "common" })),
    privateKey: z.string().trim().min(1, t("validation.privateKeyRequired", { ns: "common" })),
    sans: z
      .array(z.string().trim().min(1, t("validation.sansItemRequired", { ns: "common" })))
      .optional()
      .default([]),
  });
};