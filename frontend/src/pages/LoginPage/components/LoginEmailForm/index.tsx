import { memo } from "react";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLoginByEmail } from "@/hooks/useAuth";
import { createEmailLoginSchema, type EmailLoginFormValues } from "../../schemas/loginSchema";
import LoginEmailController from "../../controllers/LoginEmailController";
import LoginPasswordController from "../../controllers/LoginPasswordController";

import styles from "./styles.module.css";

const LoginEmailForm = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { mutateAsync: loginByEmail, isPending: isEmailLoginPending } = useLoginByEmail();
  const emailLoginSchema = createEmailLoginSchema((key: string) => t(key));
  const methods = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    mode: "onChange",
    defaultValues: { loginType: "email", email: "", password: "" },
  });

  const onSubmit = async (data: EmailLoginFormValues) => {
    try {
      await loginByEmail({ email: data.email, password: data.password });
    } catch {
      /* useAuth onError */
    }
  };

  return (
    <FormProvider {...methods}>
      <form className={styles.formContent} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <LoginEmailController />
        <LoginPasswordController />
        <button type="submit" className={styles.submitBtn} disabled={isEmailLoginPending}>
          {isEmailLoginPending ? t("loggingIn") : t("login")}
        </button>
        <span className={styles.bottomText}>
          {t("noAccount")}{" "}
          <label htmlFor="register_toggle" className={styles.switch}>
            {t("registerNow")}
          </label>
        </span>
      </form>
    </FormProvider>
  );
});

LoginEmailForm.displayName = "LoginEmailForm";
export default LoginEmailForm;
