import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@radix-ui/themes/styles.css";
import "nfx-ui/themes/fonts";
import "nfx-ui/themes/index.css";

import { LanguageEnum } from "nfx-ui/enums";
import { LanguageProvider, ThemeProvider } from "nfx-ui/providers";
import { ensureDeviceIdStorage } from "nfx-ui/stores";

import { getBuiltinI18nBundles } from "@/assets/languages/i18nResources";
import { syncDocumentLogo } from "@/constants";
import { DataProvider, ModalProvider, QueryProvider, RouterProvider } from "@/providers";

import App from "./App";

import "./index.css";

void ensureDeviceIdStorage();

function bootstrap() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <LanguageProvider fallbackLng={LanguageEnum.ZH} getBuiltinBundles={getBuiltinI18nBundles}>
          <ThemeProvider onAppearanceChange={syncDocumentLogo}>
            <DataProvider>
              <RouterProvider>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </RouterProvider>
            </DataProvider>
          </ThemeProvider>
        </LanguageProvider>
      </QueryProvider>
    </StrictMode>,
  );
}

void bootstrap();
