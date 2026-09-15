import { memo } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { RegisterFormValues } from "../../schemas/registerSchema";

const RegisterEmailController = memo(() => {
  const { t } = useTranslation("LoginPage");
  const { control, formState: { errors } } = useFormContext<RegisterFormValues>();

  return (
    <Controller
      name="email"
      control={control}
      render={({ field, fieldState }) => (
        <Flex direction="column" gap="1" flexGrow="1">
          <Text as="label" size="2" weight="medium">
            {t("email")}
          </Text>
          <TextField.Root size="3" type="email" autoComplete="email" placeholder={t("email")} color={fieldState.error ? "red" : undefined} {...field} />
          {errors.email ? (
            <Text size="1" color="red">
              {errors.email.message}
            </Text>
          ) : null}
        </Flex>
      )}
    />
  );
});

RegisterEmailController.displayName = "RegisterEmailController";
export default RegisterEmailController;
