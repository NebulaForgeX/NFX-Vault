import { z } from "zod";

export type CertificateFormValues = z.input<typeof CertificateFormSchema>;

export const CertificateFormSchema = z.object({
  store: z.enum(["websites", "apis"]),
  domain: z.string().trim().min(1, "请输入域名"),
  certificate: z.string().trim().min(1, "请输入证书内容（PEM格式）"),
  privateKey: z.string().trim().min(1, "请输入私钥内容（PEM格式）"),
  sans: z.array(z.string().trim().min(1, "SANs项不能为空")).optional().default([]),
});

