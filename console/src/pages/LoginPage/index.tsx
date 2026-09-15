import { useState } from "react";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AuthShell from "./AuthShell";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

export default function LoginPage() {
  const { t } = useTranslation("LoginPage");
  const [isRegister, setIsRegister] = useState(false);

  return (
    <AuthShell brandEyebrow="NFX Vault" brandTitle={t("title")} heroFooter={t("subtitle")}>
      <Flex direction="column" gap="5" className="js-auth-stagger">
        <Flex direction="column" gap="1">
          <Heading as="h2" size="6">
            {isRegister ? t("register") : t("login")}
          </Heading>
          <Text as="p" size="2" color="gray">
            {t("subtitle")}
          </Text>
        </Flex>
        {isRegister ? <RegisterForm /> : <LoginForm />}
        <Text as="p" size="2" align="center" color="gray">
          {isRegister ? t("hasAccount") : t("noAccount")}{" "}
          <Button type="button" variant="ghost" size="1" onClick={() => setIsRegister((v) => !v)}>
            {isRegister ? t("signInNow") : t("registerNow")}
          </Button>
        </Text>
      </Flex>
    </AuthShell>
  );
}
