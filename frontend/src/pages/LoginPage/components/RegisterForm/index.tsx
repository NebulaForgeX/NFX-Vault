import { memo } from "react";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSendVerificationCode, useSignup } from "@/hooks/useAuth";
import { useResendTimer } from "@/hooks/useResendTimer";
import { showError, showSuccess } from "@/stores/modalStore";
import { vaultApiErrorMessage } from "@/utils/vaultApiError";

import { createRegisterSchema, type RegisterFormValues } from "../../schemas/registerSchema";
import RegisterEmailController from "../../controllers/RegisterEmailController";
import RegisterPasswordController from "../../controllers/RegisterPasswordController";
import RegisterVerificationCodeController from "../../controllers/RegisterVerificationCodeController";

import styles from "./styles.module.css";

/** 与 Pqttec-Admin RegisterForm 一致，仅去掉邀请码；字段顺序：邮箱+发码 → 验证码 → 密码 */
const RegisterForm = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { mutateAsync: signup, isPending: isSigningUp } = useSignup();
  const { mutateAsync: sendCode, isPending: isSendingCode } = useSendVerificationCode();
  const { timeLeft, canResend, startTimer } = useResendTimer();

  const registerSchema = createRegisterSchema((key: string) => t(key));

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      verificationCode: "",
      password: "",
    },
  });

  const { handleSubmit, watch } = methods;
  const email = watch("email");

  const handleSendCode = async () => {
    if (!email || !canResend || isSendingCode) return;
    try {
      await sendCode({ email });
      startTimer(60);
      showSuccess(t("codeSentToEmail"));
    } catch (error) {
      showError(vaultApiErrorMessage(error, t("sendCodeFailed")));
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signup({
        email: data.email,
        password: data.password,
        verificationCode: data.verificationCode,
      });
    } catch (error) {
      console.log("error", error);
      showError(vaultApiErrorMessage(error, t("registerFailed")));
    }
  };

  const canSendCode = Boolean(email && canResend && !isSendingCode);

  return (
    <div className={styles.formWrapper}>
      <div className={styles.form}>
        <span className={styles.title}>{t("register")}</span>

        <FormProvider {...methods}>
          <form className={styles.formContent} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formControl}>
              <RegisterEmailController />
              <button
                type="button"
                className={styles.sendCodeBtn}
                onClick={handleSendCode}
                disabled={!canSendCode}
              >
                {canResend ? t("sendCode") : `${timeLeft}s`}
              </button>
            </div>

            <RegisterVerificationCodeController />
            <RegisterPasswordController />

            <button type="submit" className={styles.submitBtn} disabled={isSigningUp}>
              {isSigningUp ? t("registering") : t("register")}
            </button>

            <span className={styles.bottomText}>
              {t("hasAccount")}{" "}
              <label htmlFor="register_toggle" className={styles.switch}>
                {t("signInNow")}
              </label>
            </span>
          </form>
        </FormProvider>
      </div>
    </div>
  );
});

RegisterForm.displayName = "RegisterForm";

export default RegisterForm;
