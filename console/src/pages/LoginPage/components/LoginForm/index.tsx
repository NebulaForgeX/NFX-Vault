import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useLoginByEmail } from "@/hooks/auth";

import { createEmailLoginSchema, type EmailLoginFormValues } from "../../schemas/loginSchema";
import LoginEmailController from "../../controllers/LoginEmailController";
import LoginPasswordController from "../../controllers/LoginPasswordController";

const LoginForm = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { mutateAsync: loginByEmail, isPending } = useLoginByEmail();

  const methods = useForm<EmailLoginFormValues>({
    resolver: zodResolver(createEmailLoginSchema((key: string) => t(key))),
    mode: "onChange",
    defaultValues: { loginType: "email", email: "", password: "" },
  });

  return (
    <FormProvider {...methods}>
      <Flex direction="column" gap="4">
        <LoginEmailController />
        <LoginPasswordController />
        <Button type="button" size="3" loading={isPending} onClick={methods.handleSubmit(async (data) => loginByEmail({ email: data.email, password: data.password }))}>
          {t("login")}
        </Button>
      </Flex>
    </FormProvider>
  );
});

LoginForm.displayName = "LoginForm";
export default LoginForm;
