import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useUpdateCertificate } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useEditCertificate = (domain: string, source: string) => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useUpdateCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues & { folder_name?: string }) => {
      try {
        // 根据 source 类型决定传递哪些字段
        const sourceEnum = source as CertificateSource;
        const request: {
          domain: string;
          source: CertificateSource;
          certificate?: string;
          privateKey?: string;
          store?: CertType;
          sans?: string[];
          folder_name?: string;
          email?: string;
        } = {
          domain,
          source: sourceEnum,
        };

        if (sourceEnum === CertificateSource.MANUAL_APPLY) {
          // MANUAL_APPLY 只能更新 folder_name
          request.folder_name = values.folder_name;
        } else if (sourceEnum === CertificateSource.MANUAL_ADD) {
          // MANUAL_ADD 可以更新所有字段
          request.certificate = values.certificate?.trim();
          request.privateKey = values.privateKey?.trim();
          request.store = values.store as CertType;
          request.sans = values.sans && values.sans.length > 0 ? values.sans : undefined;
          request.folder_name = values.folder_name?.trim() || undefined;
          request.email = values.email?.trim() || undefined;
        }

        const result = await mutateAsync(request);

        if (result.success) {
          showSuccess(result.message || "证书更新成功！");
          navigate(ROUTES.CHECK);
        } else {
          showError(result.message || "更新证书失败");
        }
      } catch (error: any) {
        console.error("Edit certificate error:", error);
        showError(error?.message || "更新证书失败");
      }
    },
    [mutateAsync, navigate, domain, source],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<CertificateFormValues>) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || "请检查表单错误");
    },
    [],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useEditCertificate;

