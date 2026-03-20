import type { FieldErrors } from "react-hook-form";
import type { ApplyCertificateFormValues } from "../controllers/applyCertificateSchema";
import type { CertificateDetailResponse, CertificateResponse } from "@/types";
import { CertificateSource, CertificateStatus } from "@/types";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  ApplyCertificate,
  GetCertificateDetailById,
  ReapplyAutoCertificate,
  ReapplyManualApplyCertificate,
  ReapplyManualAddCertificate,
} from "@/apis/cert.api";
import { routerEventEmitter } from "@/events/router";
import { cacheEventEmitter, cacheEvents } from "@/events";
import { ROUTES } from "@/navigations";
import { showError, showSuccess, showLoading, hideLoading, showConfirm } from "@/stores/modalStore";

/** 后台异步签发后轮询详情，直到成功/失败或超时（默认 6 分钟） */
async function waitForIssuanceOutcome(
  certificateId: string,
  maxMs: number,
): Promise<"success" | "fail" | "timeout"> {
  const start = Date.now();
  const interval = 2000;
  while (Date.now() - start < maxMs) {
    const detail = await GetCertificateDetailById(certificateId);
    if (detail.status === CertificateStatus.SUCCESS) return "success";
    if (detail.status === CertificateStatus.FAIL) return "fail";
    await new Promise<void>((r) => {
      setTimeout(r, interval);
    });
  }
  return "timeout";
}

export const useSubmitApplyCertificate = (
  source: CertificateSource = CertificateSource.MANUAL_APPLY,
  certificate?: CertificateDetailResponse | null
) => {
  const { t: tElements } = useTranslation("certificateElements");
  const { t: tEditApply } = useTranslation("certEditApply");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { values: ApplyCertificateFormValues }) => {
      showLoading({
        title: tElements("apply.title"),
        message: tElements("apply.applying"),
      });
      try {
        // 根据 source 调用不同的 API
        if (certificate?.id) {
          // Reapply 场景
          switch (source) {
            case CertificateSource.AUTO:
              return await ReapplyAutoCertificate({
                certificateId: certificate.id,
                email: data.values.email.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            case CertificateSource.MANUAL_APPLY:
              return await ReapplyManualApplyCertificate({
                certificateId: certificate.id,
                domain: data.values.domain.trim(),
                email: data.values.email.trim(),
                folderName: data.values.folderName.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            case CertificateSource.MANUAL_ADD:
              return await ReapplyManualAddCertificate({
                certificateId: certificate.id,
                email: data.values.email.trim(),
                sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
                webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
                forceRenewal: data.values.forceRenewal || false,
              });
            default:
              throw new Error("Invalid certificate source");
          }
        } else {
          // 新申请场景
          return await ApplyCertificate({
            domain: data.values.domain.trim(),
            email: data.values.email.trim(),
            folderName: data.values.folderName.trim(),
            sans: data.values.sans && data.values.sans.length > 0 ? data.values.sans : undefined,
            webroot: data.values.webroot && data.values.webroot.trim() ? data.values.webroot.trim() : undefined,
          });
        }
      } finally {
        hideLoading();
      }
    },
    onSuccess: (result: CertificateResponse) => {
      const emitCaches = () => {
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "database");
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "websites");
        cacheEventEmitter.emit(cacheEvents.REFRESH_CERTIFICATES, "apis");
      };

      if (!result.success) {
        const errorMsg = result.error
          ? `${result.message}\n${tElements("messages.errorReason")}: ${result.error}`
          : result.message || tElements("messages.certificateApplyFailed");
        showError(errorMsg);
        return;
      }

      emitCaches();

      const cid = result.certificateId ?? certificate?.id;
      if (result.status === CertificateStatus.PROCESS && cid) {
        showSuccess(result.message || tElements("messages.certificateApplySuccess"));
        void (async () => {
          try {
            const outcome = await waitForIssuanceOutcome(cid, 360000);
            emitCaches();
            if (outcome === "success") {
              showSuccess(tElements("messages.certificateApplySuccess"));
              routerEventEmitter.navigate({ to: ROUTES.CHECK });
              return;
            }
            if (outcome === "fail") {
              const detail = await GetCertificateDetailById(cid);
              const err =
                detail.lastErrorMessage?.trim() ||
                tElements("messages.certificateApplyFailed");
              showError(err);
              routerEventEmitter.navigate({ to: ROUTES.CHECK });
              return;
            }
            showError(tElements("messages.applyPollTimeout"));
            routerEventEmitter.navigate({ to: ROUTES.CHECK });
          } catch (e) {
            console.error("Poll issuance outcome:", e);
            showError(tElements("messages.certificateApplyFailed"));
          }
        })();
        return;
      }

      if (result.status === CertificateStatus.PROCESS && !cid) {
        showSuccess(result.message || tElements("messages.certificateApplySuccess"));
        routerEventEmitter.navigate({ to: ROUTES.CHECK });
        return;
      }

      showSuccess(result.message || tElements("messages.certificateApplySuccess"));
      routerEventEmitter.navigate({ to: ROUTES.CHECK });
    },
    onError: (error: Error) => {
      console.error("Apply certificate error:", error);
      showError(error.message || tElements("messages.certificateApplyFailed"));
    },
  });

  const onSubmit = useCallback(
    async (values: ApplyCertificateFormValues) => {
      // 显示确认 modal
      const domain = certificate?.domain || values.domain;
      // 对于 manual apply，使用 "申请证书" 而不是 "重新申请证书"
      const confirmMessage = values.forceRenewal
        ? tEditApply("reapply.confirmMessageForce", { domain })
        : tEditApply("reapply.confirmMessage", { domain });
      
      showConfirm({
        title: source === CertificateSource.MANUAL_APPLY 
          ? tEditApply("form.applyTitle") || "申请证书"
          : tEditApply("reapply.confirmTitle"),
        message: confirmMessage,
        confirmText: tEditApply("reapply.confirm"),
        cancelText: tEditApply("reapply.cancel"),
        onConfirm: async () => {
          try {
            await mutateAsync({ values });
          } catch (error) {
            console.error("Apply certificate error:", error);
          }
        },
      });
    },
    [mutateAsync, certificate, source, tEditApply],
  );

  const onSubmitError = useCallback(
    (errors: FieldErrors<ApplyCertificateFormValues>) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      showError(firstError?.message || tElements("messages.checkFormErrors"));
    },
    [tElements],
  );

  return {
    onSubmit,
    onSubmitError,
    isPending,
  };
};

export default useSubmitApplyCertificate;

