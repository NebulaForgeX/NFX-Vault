import { z } from "zod";

export type ApplyCertificateFormValues = z.input<typeof ApplyCertificateFormSchema>;
export const ApplyCertificateFormSchema = z.object({
  domain: z.string().trim().min(1, "请输入域名"),
  email: z.string().trim().email("请输入有效的邮箱地址"),
  folderName: z.string().trim().min(1, "请输入文件夹名称").regex(/^[a-zA-Z0-9_-]+$/, "文件夹名称只能包含字母、数字、下划线和连字符"),
  sans: z.array(z.string().trim().min(1, "SANs内容不能为空")).optional().default([]),
  webroot: z.string().trim().optional(),
});

