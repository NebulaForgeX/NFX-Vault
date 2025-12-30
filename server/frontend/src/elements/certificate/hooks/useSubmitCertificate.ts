import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateCertificate } from "@/hooks";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useSubmitCertificate = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCertificate();

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        const result = await mutateAsync({
          store: values.store,
          domain: values.domain.trim(),
          certificate: values.certificate.trim(),
          privateKey: values.privateKey.trim(),
          sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
          folder_name: values.folder_name?.trim() || undefined,
          email: values.email?.trim() || undefined,
          issuer: values.issuer?.trim() || undefined,
        });

        if (result.success) {
          showSuccess(result.message || "证书创建成功！");
          navigate(ROUTES.CHECK);
        } else {
          showError(result.message || "创建证书失败");
        }
      } catch (error: any) {
        console.error("Submit certificate error:", error);
        showError(error?.message || "创建证书失败");
      }
    },
    [mutateAsync, navigate],
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

export default useSubmitCertificate;

