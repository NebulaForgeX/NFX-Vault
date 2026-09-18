import type { AxiosError } from "axios";
import type { NormalUnifiedQueryOptions } from "nfx-ui/hooks";
import type { SystemState } from "@/apis/system.api";

import { useMutation } from "@tanstack/react-query";
import { useUnifiedQuery } from "nfx-ui/hooks";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError } from "@/stores/modalStore";

import { useSystemRepository } from "@/apis/repositories";
import { SYSTEM_STATE } from "@/constants";

export const useLatestSystemState = (options?: NormalUnifiedQueryOptions<SystemState>) => {
  const system = useSystemRepository();
  return useUnifiedQuery(() => system.GetLatestSystemState(), SYSTEM_STATE(), {}, options);
};

export const useInitializeSystem = () => {
  const system = useSystemRepository();
  return useMutation({
    mutationFn: (version?: string) => system.InitializeSystem(version),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useInitializeSystem]")),
  });
};
