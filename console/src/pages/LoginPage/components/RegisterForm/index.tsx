import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useSendVerificationCode, useSignup } from "@/hooks/auth";
import { useResendTimer } from "@/hooks/resendTimer";
import { showError, showSuccess } from "nfx-ui/stores";
import { vaultApiErrorMessage } from "@/utils/vaultApiError";

import { createRegisterSchema, type RegisterFormValues } from "../../schemas/registerSchema";
import RegisterEmailController from "../../controllers/RegisterEmailController";
import RegisterPasswordController from "../../controllers/RegisterPasswordController";
import RegisterVerificationCodeController from "../../controllers/RegisterVerificationCodeController";

const RegisterForm = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { mutateAsync: signup, isPending: isSigningUp } = useSignup();
  const { mutateAsync: sendCode, isPending: isSendingCode } = useSendVerificationCode();
  const { timeLeft, canResend, startTimer } = useResendTimer();

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema((key: string) => t(key))),
    mode: "onChange",
    defaultValues: { email: "", verificationCode: "", password: "" },
  });

  const email = methods.watch("email");

  return (
    <FormProvider {...methods}>
      <Flex direction="column" gap="4">
        <Flex gap="2" align="end">
          <RegisterEmailController />
          <Button
            type="button"
            variant="soft"
            size="3"
            disabled={!email || !canResend || isSendingCode}
            loading={isSendingCode}
            onClick={async () => {
              try {
                await sendCode({ email });
                startTimer(60);
                showSuccess(t("codeSentToEmail"));
              } catch (error) {
                showError(vaultApiErrorMessage(error, t("sendCodeFailed")));
              }
            }}
          >
            {canResend ? t("sendCode") : `${timeLeft}s`}
          </Button>
        </Flex>
        <RegisterVerificationCodeController />
        <RegisterPasswordController />
        <Button
          type="button"
          size="3"
          loading={isSigningUp}
          onClick={methods.handleSubmit(async (data) => {
            try {
              await signup({ email: data.email, password: data.password, verificationCode: data.verificationCode });
            } catch (error) {
              showError(vaultApiErrorMessage(error, t("registerFailed")));
            }
          })}
        >
          {t("register")}
        </Button>
      </Flex>
    </FormProvider>
  );
});

RegisterForm.displayName = "RegisterForm";
export default RegisterForm;
