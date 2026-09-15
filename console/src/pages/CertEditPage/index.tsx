import { memo } from "react";
import { Button } from "@radix-ui/themes";
import { ArrowLeft, FilePen } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { PageHeader, Suspense } from "nfx-ui/components";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { CertificateEditForm, useInitCertificateForm, useEditCertificate } from "@/elements/certificate";
import { useCertificateDetailById } from "@/hooks";

const CertEditPageContent = memo(({ certificateId }: { certificateId: string }) => {
  const { t } = useTranslation("certEdit");
  const { data: certificate } = useCertificateDetailById(certificateId);
  const methods = useInitCertificateForm(certificate);
  const { onSubmit, onSubmitError, isPending } = useEditCertificate(certificateId);

  return (
    <FormProvider {...methods}>
      <PageFrame>
        <PageHeader
          icon={FilePen}
          title={`${t("title")} — ${certificate.domain}`}
          description={t("subtitle")}
          actions={
            <Button variant="ghost" onClick={() => routerEventEmitter.navigateBack()}>
              <ArrowLeft size={16} />
            </Button>
          }
        />
        <CertificateEditForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
      </PageFrame>
    </FormProvider>
  );
});

CertEditPageContent.displayName = "CertEditPageContent";

export default function CertEditPage() {
  const { t } = useTranslation("certEdit");
  const { certificateId } = useParams<{ certificateId: string }>();

  if (!certificateId) {
    routerEventEmitter.navigateBack();
    return null;
  }

  return (
    <Suspense loadingText={t("loading")}>
      <CertEditPageContent certificateId={certificateId} />
    </Suspense>
  );
}
