import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { FileKey } from "lucide-react";
import { PageFrame } from "nfx-ui/layouts";
import { EmptyState, Suspense } from "nfx-ui/components";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { safeStringable } from "nfx-ui/utils";
import { routerEventEmitter } from "@/events/router";
import { useCertificateDetailById } from "@/hooks";
import { ROUTES } from "@/navigations";
import { showSuccess } from "nfx-ui/stores";
import {
  CertDetailHeader,
  CertificateInfo,
  CertificateSansSection,
  CertificateContent,
  PrivateKeyContent,
  CertificateOperations,
  ExportCertificate,
  SansChangedBanner,
} from "./components";

const CertDetailContent = memo(() => {
  const { t } = useTranslation("certDetail");
  const { certificateId } = useParams<{ certificateId: string }>();
  const { data: certDetail } = useCertificateDetailById(safeStringable(certificateId));

  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(certDetail.certificate);
    showSuccess(t("copy.success") || "Certificate copied to clipboard");
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(certDetail.privateKey);
    showSuccess(t("copy.success") || "Private key copied to clipboard");
  };

  return (
    <PageFrame>
      <CertDetailHeader certDetail={certDetail} />
      <Flex direction="column" gap="4">
        <SansChangedBanner visible={Boolean(certDetail.sansChanged)} />
        <CertificateInfo certDetail={certDetail} />
        <CertificateSansSection sans={certDetail.sans} />
        <Flex gap="4" wrap="wrap">
          <Flex style={{ flex: "1 1 280px" }}>
            <CertificateContent certificate={certDetail.certificate} onCopy={handleCopyCertificate} />
          </Flex>
          <Flex style={{ flex: "1 1 280px" }}>
            <PrivateKeyContent privateKey={certDetail.privateKey} onCopy={handleCopyPrivateKey} />
          </Flex>
        </Flex>
        <ExportCertificate
          certificate={certDetail.certificate}
          privateKey={certDetail.privateKey}
          domain={certDetail.domain}
          certificateId={certDetail.id}
        />
        <CertificateOperations certificateId={certDetail.id} />
      </Flex>
    </PageFrame>
  );
});
CertDetailContent.displayName = "CertDetailContent";

const CertDetailPage = memo(() => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { t } = useTranslation("certDetail");

  if (!certificateId) {
    return (
      <PageFrame>
        <EmptyState
          icon={FileKey}
          title={t("error.loadFailed") || "Invalid certificate parameters"}
          action={
            <Button onClick={() => routerEventEmitter.navigate({ to: ROUTES.CHECK })}>
              {t("back") || "Back to Certificate List"}
            </Button>
          }
        />
      </PageFrame>
    );
  }

  return (
    <Suspense loadingText={t("loading") || "Loading certificate..."}>
      <CertDetailContent />
    </Suspense>
  );
});

CertDetailPage.displayName = "CertDetailPage";
export default CertDetailPage;
