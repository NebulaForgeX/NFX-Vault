import { memo } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { RegisterFormValues } from "../../schemas/registerSchema";

const RegisterVerificationCodeController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { control, formState: { errors } } = useFormContext<RegisterFormValues>();

  return (
    <Controller
      name="verificationCode"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            {t("verificationCode")}
          </Text>
          <TextField.Root
            size="3"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            placeholder={t("verificationCode")}
            color={fieldState.error ? "red" : undefined}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          {errors.verificationCode ? (
            <Text size="1" color="red">
              {errors.verificationCode.message}
            </Text>
          ) : null}
        </Flex>
      )}
    />
  );
});

RegisterVerificationCodeController.displayName = "RegisterVerificationCodeController";
export default RegisterVerificationCodeController;
