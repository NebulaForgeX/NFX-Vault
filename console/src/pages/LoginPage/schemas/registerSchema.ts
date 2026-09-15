import { z } from "zod";

/** 与 Pqttec-Admin registerSchema 一致，无邀请码：email + verificationCode(6) + password */
export const createRegisterSchema = (t: (key: string) => string) => {
  return z.object({
    email: z.string().min(1, t("validation.emailRequired")).email(t("validation.emailInvalid")),
    verificationCode: z
      .string()
      .trim()
      .min(1, t("validation.verificationCodeRequired"))
      .length(6, t("validation.verificationCodeLength")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .min(8, t("validation.passwordMinLength8")),
  });
};

const BaseRegisterSchema = z.object({
  email: z.string().min(1).email(),
  verificationCode: z.string().trim().min(1).length(6),
  password: z.string().min(1).min(8),
});

export type RegisterFormValues = z.infer<typeof BaseRegisterSchema>;
