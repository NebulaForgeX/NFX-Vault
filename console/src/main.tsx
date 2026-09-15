import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@radix-ui/themes/styles.css";
import "nfx-ui/themes/fonts";
import "nfx-ui/themes/styles.css";

import { LanguageEnum } from "nfx-ui/enums";
import { LanguageProvider, ThemeProvider, ModalProvider, DataProvider } from "nfx-ui/providers";
import { LayoutProvider } from "nfx-ui/layouts";

import "./index.css";

import { getBuiltinBundles } from "@/assets/languages";
import { VaultDataProvider, QueryProvider, RouterProvider } from "@/providers";

import App from "./App.tsx";

async function onLoadExtraBundles(_lng: LanguageEnum) {
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <LanguageProvider fallbackLng={LanguageEnum.ZH} getBuiltinBundles={getBuiltinBundles} onLoadExtraBundles={onLoadExtraBundles}>
        <ThemeProvider>
          <LayoutProvider>
            <DataProvider>
              <VaultDataProvider>
                <RouterProvider>
                  <ModalProvider>
                    <App />
                  </ModalProvider>
                </RouterProvider>
              </VaultDataProvider>
            </DataProvider>
          </LayoutProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  </StrictMode>,
);
