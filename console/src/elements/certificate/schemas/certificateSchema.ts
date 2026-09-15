import { z } from "zod";
import type { TFunction } from "i18next";

const folderNameField = (t: TFunction) =>
  z
    .string()
    .trim()
    .default("")
    .refine((v) => !v || /^[a-zA-Z0-9_-]+$/.test(v), t("validation.folderNameInvalid", { ns: "common" }));

const sansField = (t: TFunction) =>
  z.array(z.string().trim().min(1, t("validation.sansItemRequired", { ns: "common" }))).default([]);

/** 申请页与编辑页共有的表单字段（无 PEM / 私钥）。 */
export type CertificateFormSharedValues = {
  domain: string;
  folderName: string;
  email: string;
  issuer: string;
  sans: string[];
  webroot: string;
  forceRenewal: boolean;
};

export type EditCertificateFormValues = CertificateFormSharedValues;

/** 含手动上传 PEM 的申请/录入表单。 */
export type CertificateFormValues = CertificateFormSharedValues & {
  certificate: string;
  privateKey: string;
};

/** 新建证书：Let's Encrypt 申请，不要求 PEM。 */
export const createApplyCertificateFormSchema = (t: TFunction) => {
  return z.object({
    domain: z.string().trim().min(1, t("validation.domainRequired", { ns: "common" })),
    folderName: folderNameField(t),
    email: z
      .string()
      .trim()
      .min(1, t("validation.emailRequired", { ns: "common" }))
      .email(t("validation.emailRequired", { ns: "common" })),
    issuer: z.string().trim().default(""),
    certificate: z.string().default(""),
    privateKey: z.string().default(""),
    sans: sansField(t),
    webroot: z.string().trim().default(""),
    forceRenewal: z.boolean().default(false),
  });
};

/** 编辑手动添加的证书：仅元数据，不可改 PEM/私钥。 */
export const createEditCertificateFormSchema = (t: TFunction) => {
  return z.object({
    domain: z.string().trim().min(1, t("validation.domainRequired", { ns: "common" })),
    folderName: folderNameField(t),
    email: z.union([
      z.literal(""),
      z.string().trim().email(t("validation.emailRequired", { ns: "common" })),
    ]),
    issuer: z.string().trim().default(""),
    sans: sansField(t),
    webroot: z.string().trim().default(""),
    forceRenewal: z.boolean().default(false),
  });
};
