import { memo } from "react";

import ConfirmModal from "@/providers/ModalProvider/components/ConfirmModal";
import FileModal from "@/providers/ModalProvider/components/FileModal";
import SearchModal from "@/providers/ModalProvider/components/SearchModal";
import TooltipModal from "@/providers/ModalProvider/components/TooltipModal";

/** Product overlays (file/search/tooltip/force-renewal confirm). Generic Base/Confirm/Loading come from nfx-ui ModalProvider. */
export const VaultOverlays = memo(() => (
  <>
    <ConfirmModal />
    <SearchModal />
    <FileModal />
    <TooltipModal />
  </>
));

VaultOverlays.displayName = "VaultOverlays";
