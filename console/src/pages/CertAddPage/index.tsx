import { memo } from "react";
import { Button } from "@radix-ui/themes";
import { ArrowLeft, FilePlus } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { PageHeader, Suspense } from "nfx-ui/components";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { CertificateApplyForm, useInitApplyCertificateForm, useSubmitCertificate } from "@/elements/certificate";

const CertAddPage = memo(() => {
  const { t } = useTranslation("certAdd");

  const methods = useInitApplyCertificateForm();
  const { onSubmit, onSubmitError, isPending } = useSubmitCertificate();

  const handleBack = () => routerEventEmitter.navigateBack();

  return (
    <FormProvider {...methods}>
      <PageFrame>
        <PageHeader
          icon={FilePlus}
          title={t("title")}
          actions={
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft size={16} />
            </Button>
          }
        />
        <Suspense loadingText={t("loading")}>
          <CertificateApplyForm onSubmit={onSubmit} onSubmitError={onSubmitError} isPending={isPending} />
        </Suspense>
      </PageFrame>
    </FormProvider>
  );
});

CertAddPage.displayName = "CertAddPage";

export default CertAddPage;
