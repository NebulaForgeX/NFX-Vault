import type { ReactNode } from "react";

import { Suspense as NfxSuspense } from "nfx-ui/components";

export type SuspenseProps = {
  children: ReactNode;
  loadingText?: string;
  loadingType?: string;
  loadingSize?: string;
  loadingContainerClassName?: string;
};

export default function Suspense({ children, loadingText }: SuspenseProps) {
  return <NfxSuspense loadingText={loadingText}>{children}</NfxSuspense>;
}
