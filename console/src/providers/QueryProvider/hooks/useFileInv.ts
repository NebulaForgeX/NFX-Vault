import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

import { FILE_CONTENT, FILE_DIRECTORY } from "@/constants";
import { fileEventEmitter, fileEvents } from "@/events/file";

export const useFileInv = (queryClient: QueryClient) => {
  useEffect(() => {
    const onInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: FILE_DIRECTORY.getPrefix, exact: false });
      queryClient.invalidateQueries({ queryKey: FILE_CONTENT.getPrefix, exact: false });
    };

    fileEventEmitter.on(fileEvents.INVALIDATE_DIRECTORY, onInvalidate);

    return () => {
      fileEventEmitter.off(fileEvents.INVALIDATE_DIRECTORY, onInvalidate);
    };
  }, [queryClient]);
};
