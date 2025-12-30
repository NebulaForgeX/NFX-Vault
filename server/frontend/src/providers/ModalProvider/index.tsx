import type { ReactNode } from "react";

import { memo } from "react";

import { BaseModal, ConfirmModal, SearchModal, LoadingModal } from "./components";

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider = memo(({ children }: ModalProviderProps) => {

  return (
    <>
      {children}
      <BaseModal />
      <ConfirmModal />
      <SearchModal />
      <LoadingModal />
    </>
  );
});

ModalProvider.displayName = "ModalProvider";
export default ModalProvider;
