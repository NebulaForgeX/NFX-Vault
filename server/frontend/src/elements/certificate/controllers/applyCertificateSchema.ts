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
  });
};

// 向后兼容：导出一个默认 schema（使用英文作为后备）
export const ApplyCertificateFormSchema = z.object({
  domain: z.string().trim().min(1, "Please enter domain name"),
  email: z.string().trim().email("Please enter a valid email address"),
  folderName: z
    .string()
    .trim()
    .min(1, "Please enter folder name")
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name can only contain letters, numbers, underscores, and hyphens"),
  sans: z.array(z.string().trim().min(1, "SANs content cannot be empty")).optional().default([]),
  webroot: z.string().trim().optional(),
});

