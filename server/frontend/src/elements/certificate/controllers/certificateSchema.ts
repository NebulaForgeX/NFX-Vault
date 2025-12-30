import { z } from "zod";

export type CertificateFormValues = z.input<typeof CertificateFormSchema>;

export const CertificateFormSchema = z.object({
  store: z.enum(["websites", "apis", "database"]),
  domain: z.string().trim().min(1, "请输入域名"),
  folderName: z.string().trim().min(1, "请输入文件夹名称").regex(/^[a-zA-Z0-9_-]+$/, "文件夹名称只能包含字母、数字、下划线和连字符").optional(),
  email: z.string().trim().email("请输入有效的邮箱地址").optional(),
  issuer: z.string().trim().optional(),
  certificate: z.string().trim().min(1, "请输入证书内容（PEM格式）"),
  privateKey: z.string().trim().min(1, "请输入私钥内容（PEM格式）"),
  sans: z.array(z.string().trim().min(1, "SANs项不能为空")).optional().default([]),
});

