import { z } from "zod";

/** 与 Pqttec-Admin 一致；Vault 后端密码最少 8 位 */
export const createEmailLoginSchema = (t: (key: string) => string) => {
  return z.object({
    loginType: z.literal("email"),
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .min(8, t("validation.passwordMinLength8")),
  });
};

const BaseEmailLoginSchema = z.object({
  loginType: z.literal("email"),
  email: z.string().min(1).email(),
  password: z.string().min(1).min(8),
});

export type EmailLoginFormValues = z.infer<typeof BaseEmailLoginSchema>;
