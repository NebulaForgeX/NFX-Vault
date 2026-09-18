import type { AnalyzeTLSRequest } from "@/types";
import type { AxiosError } from "axios";

import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "nfx-ui/utils";
import { showError } from "@/stores/modalStore";

import { useAnalysisRepository } from "@/apis/repositories";

export const useAnalyzeTls = () => {
  const analysis = useAnalysisRepository();
  return useMutation({
    mutationFn: (params: AnalyzeTLSRequest) => analysis.AnalyzeTLS(params),
    onError: (error: AxiosError) => showError(getApiErrorMessage(error, "[useAnalyzeTls]")),
  });
};
