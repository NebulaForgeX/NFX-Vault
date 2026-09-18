import type { ReactNode } from "react";

import { Base } from "./components";
import ConfirmModal from "./components/ConfirmModal";
import FileModal from "./components/FileModal";
import SearchModal from "./components/SearchModal";
import TooltipModal from "./components/TooltipModal";
import { useSystemFeedbackInv } from "./hooks/useSystemFeedbackInv";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  useSystemFeedbackInv();
  return (
    <>
      {children}
      <Base />
      <ConfirmModal />
      <SearchModal />
      <FileModal />
      <TooltipModal />
    </>
  );
};

export default ModalProvider;
