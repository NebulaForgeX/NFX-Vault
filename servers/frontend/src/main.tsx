import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { LanguageEnum, LanguageProvider } from "nfx-ui/languages";
import { ThemeEnum, ThemeProvider } from "nfx-ui/themes";
import { LayoutProvider } from "nfx-ui/layouts";

import { NAME_SPACES, NAME_SPACES_MAP, RESOURCES } from "@/assets/languages/i18nResources";
import { BrowserRouterProvider, ModalProvider, QueryProvider } from "@/providers";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <LanguageProvider
        bundles={{ RESOURCES, NAME_SPACES_MAP, NAME_SPACES }}
        fallbackLng={LanguageEnum.ZH}
      >
        <ThemeProvider defaultTheme={ThemeEnum.DEFAULT}>
          <LayoutProvider>
            <BrowserRouterProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </BrowserRouterProvider>
          </LayoutProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryProvider>
  </StrictMode>,
);
