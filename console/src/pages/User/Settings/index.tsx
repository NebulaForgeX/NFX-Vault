import { Box, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Settings2 } from "lucide-react";
import { LucideIcon, ThemeSettings } from "nfx-ui/components";
import { PageFrame } from "nfx-ui/layouts";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

function SettingsPage() {
  const { t } = useTranslation("pages.User.Settings");

  return (
    <PageFrame>
      <Flex direction="column" gap="5" py="5">
        <Box asChild>
          <header>
            <Flex align="center" gap="4">
              <Flex align="center" justify="center" flexShrink="0" width="48px" height="48px" className={styles.pageIcon}>
                <LucideIcon icon={Settings2} size={22} />
              </Flex>
              <Box>
                <Heading as="h1" size="6" mb="1">
                  {t("title")}
                </Heading>
                <Text as="p" size="2" color="gray">
                  {t("subtitle")}
                </Text>
              </Box>
            </Flex>
          </header>
        </Box>

        <Section size="2" aria-labelledby="settings-theme-heading">
          <Box mb="4">
            <Heading as="h2" id="settings-theme-heading" size="3" mb="1">
              {t("sections.theme")}
            </Heading>
            <Text as="p" size="2" color="gray">
              {t("sections.themeDesc")}
            </Text>
          </Box>
          <ThemeSettings />
        </Section>
      </Flex>
    </PageFrame>
  );
}

export default SettingsPage;
