import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../controllers/certificateSchema";

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useUpdateManualAddCertificate, useUpdateManualApplyCertificate } from "@/hooks";
import { CertificateSource } from "@/apis/domain";
import type { CertType } from "@/types";
import { showError, showSuccess } from "@/stores/modalStore";
import { ROUTES } from "@/types/navigation";

export const useEditCertificate = (domain: string, source: CertificateSource, certificateId?: string) => {
  const navigate = useNavigate();
  const { mutateAsync: mutateManualAdd, isPending: isPendingManualAdd } = useUpdateManualAddCertificate();
  const { mutateAsync: mutateManualApply, isPending: isPendingManualApply } = useUpdateManualApplyCertificate();

  const isPending = isPendingManualAdd || isPendingManualApply;

  const onSubmit = useCallback(
    async (values: CertificateFormValues) => {
      try {
        let result;
        
        if (source === CertificateSource.MANUAL_APPLY) {
          // MANUAL_APPLY 只能更新 folder_name
          if (!values.folderName) {
            showError("文件夹名称是必需的");
            return;
          }
          result = await mutateManualApply({
            domain,
            folderName: values.folderName,
          });
        } else if (source === CertificateSource.MANUAL_ADD) {
          // MANUAL_ADD 可以更新所有字段
          if (!certificateId) {
            showError("证书 ID 缺失，无法更新");
            return;
          }
          result = await mutateManualAdd({
            certificateId, // 传递证书 ID（必需）
            certificate: values.certificate?.trim(),
            privateKey: values.privateKey?.trim(),
            store: values.store as CertType,
            sans: values.sans && values.sans.length > 0 ? values.sans : undefined,
            folderName: values.folderName?.trim() || undefined,
            email: values.email?.trim() || undefined,
          });
        } else {
          showError("不支持的证书来源类型");
          return;
        }

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
    [mutateManualAdd, mutateManualApply, navigate, domain, source, certificateId],
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

