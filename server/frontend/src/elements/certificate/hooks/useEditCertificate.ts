import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useUpdateCertificate } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useEditCertificate = (domain: string, source: string) => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useUpdateCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        const result = await mutateAsync({
          domain,
          source: source as any,
          certificate: values.certificate.trim(),
          privateKey: values.privateKey.trim(),
          store: values.store,
          sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
        });

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

