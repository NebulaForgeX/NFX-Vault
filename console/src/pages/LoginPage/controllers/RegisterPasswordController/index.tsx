import { memo } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { RegisterFormValues } from "../../schemas/registerSchema";

const RegisterPasswordController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { control, formState: { errors } } = useFormContext<RegisterFormValues>();

  return (
    <Controller
      name="password"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">
            {t("password")}
          </Text>
          <TextField.Root size="3" type="password" autoComplete="new-password" placeholder={t("password")} color={fieldState.error ? "red" : undefined} {...field} />
          {errors.password ? (
            <Text size="1" color="red">
              {errors.password.message}
            </Text>
          ) : null}
        </Flex>
      )}
    />
  );
});

RegisterPasswordController.displayName = "RegisterPasswordController";
export default RegisterPasswordController;
