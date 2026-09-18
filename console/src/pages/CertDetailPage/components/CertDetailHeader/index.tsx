import { memo } from "react";
import { Badge, Button, Flex } from "@radix-ui/themes";
import { ArrowLeft, Clock, FileKey } from "lucide-react";
import { PageHeader } from "@/components";
import { useTranslation } from "react-i18next";

import { routerEventEmitter } from "@/events/router";
import { buildCertCheckPath } from "@/utils/certCheckUrl";
import { useCertificateTime, useCertificateCountdown } from "@/hooks";
import type { CertificateDetailResponse } from "@/types";

interface CertDetailHeaderProps {
  certDetail: CertificateDetailResponse;
}

const CertDetailHeader = memo(({ certDetail }: CertDetailHeaderProps) => {
  const { t } = useTranslation("certDetail");
  const timeInfo = useCertificateTime(certDetail);
  const { countdown, isExpired } = useCertificateCountdown(certDetail.notAfter);

  return (
    <PageHeader
      icon={FileKey}
      title={certDetail.domain}
      description={countdown}
      actions={
        <Flex gap="2" align="center" wrap="wrap">
          <Badge>{timeInfo.label}</Badge>
          {certDetail.notAfter && countdown ? (
            <Badge color={isExpired ? "red" : "blue"}>
              <Clock size={12} /> {countdown}
            </Badge>
          ) : null}
          <Button variant="ghost" onClick={() => routerEventEmitter.navigate({ to: buildCertCheckPath() })}>
            <ArrowLeft size={16} />
            {t("back") || "Back"}
          </Button>
        </Flex>
      }
    />
  );
});

CertDetailHeader.displayName = "CertDetailHeader";
export default CertDetailHeader;
