import { memo, useState } from "react";
import { Button, Card, Flex, Text, TextArea } from "@radix-ui/themes";
import { ArrowLeft, FileSearch, KeyRound, Shield } from "lucide-react";
import { PageFrame } from "@/layouts";
import { CardHeader, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "nfx-ui/utils";
import { routerEventEmitter } from "@/events/router";
import type { AnalyzeTLSResponse } from "@/types";
import { useAnalyzeTls } from "@/hooks/analysis";

const TLSAnalysisPage = memo(() => {
  const { t } = useTranslation("tlsAnalysis");

  const analyzeMutation = useAnalyzeTls();
  const [certificate, setCertificate] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState<AnalyzeTLSResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => routerEventEmitter.navigateBack();

  const handleCertificateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCertificate(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handlePrivateKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPrivateKey(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!certificate.trim()) {
      setError("Please provide a certificate");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeMutation.mutateAsync({
        certificate: certificate.trim(),
        privateKey: privateKey.trim() || undefined,
      });
      setResult(response);
      if (!response.success)  setError(response.message);
      
    } catch (err: unknown) {
      setError(getApiErrorMessage(err as never, "Failed to analyze certificate"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCertificate("");
    setPrivateKey("");
    setResult(null);
    setError(null);
  };

  return (
    <PageFrame>
      <PageHeader
        icon={Shield}
        title={t("title") || "TLS Certificate Analysis"}
        actions={
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
        }
      />
      <Flex gap="4" wrap="wrap">
        <Flex direction="column" gap="4" style={{ flex: "1 1 360px" }}>
          <Card size="3">
            <CardHeader icon={<Shield size={18} />} title="Certificate (PEM)" />
            <Flex direction="column" gap="3">
              <input type="file" accept=".crt,.pem,.cert" onChange={handleCertificateFileUpload} />
              <TextArea placeholder="Paste certificate content here (PEM format)..." value={certificate} onChange={(e) => setCertificate(e.target.value)} rows={10} />
            </Flex>
          </Card>
          <Card size="3">
            <CardHeader icon={<KeyRound size={18} />} title="Private Key (PEM) - Optional" />
            <Flex direction="column" gap="3">
              <input type="file" accept=".key,.pem" onChange={handlePrivateKeyFileUpload} />
              <TextArea placeholder="Paste private key content here (PEM format)..." value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} rows={10} />
            </Flex>
          </Card>
          <Flex gap="2">
            <Button onClick={handleAnalyze} disabled={!certificate.trim()} loading={isLoading}>
              <FileSearch size={16} />
              {isLoading ? "Analyzing..." : "Analyze Certificate"}
            </Button>
            <Button variant="soft" onClick={handleClear}>
              Clear
            </Button>
          </Flex>
          {error ? <Text color="red">{error}</Text> : null}
        </Flex>
        <Flex direction="column" gap="3" style={{ flex: "1 1 320px" }}>
          {result?.success && result.data ? (
            <Card size="3">
              <CardHeader icon={<FileSearch size={18} />} title="Analysis Results" />
              <Flex direction="column" gap="3">
                <Text size="2">Valid: {result.data.summary.isValid ? "Yes" : "No"}</Text>
                <Text size="2">Days Remaining: {result.data.summary.daysRemaining ?? "N/A"}</Text>
                <Text size="2">Has Private Key: {result.data.summary.hasPrivateKey ? "Yes" : "No"}</Text>
                {result.data.summary.keyValid !== null ? (
                  <Text size="2">Private Key Valid: {result.data.summary.keyValid ? "Yes" : "No"}</Text>
                ) : null}
                <Text size="2">Domain: {result.data.certificate.domain || "N/A"}</Text>
                <Text size="2">Issuer: {result.data.certificate.issuer || "N/A"}</Text>
                <Text size="2">Not Before: {result.data.certificate.notBefore || "N/A"}</Text>
                <Text size="2">Not After: {result.data.certificate.notAfter || "N/A"}</Text>
                {result.data.certificate.allDomains && result.data.certificate.allDomains.length > 0 ? (
                  <Flex gap="2" wrap="wrap">
                    {result.data.certificate.allDomains.map((domain) => (
                      <Text key={domain} size="1">
                        {domain}
                      </Text>
                    ))}
                  </Flex>
                ) : null}
              </Flex>
            </Card>
          ) : (
            <EmptyState icon={FileSearch} title={t("emptyResult") || "Paste a certificate to analyze"} />
          )}
        </Flex>
      </Flex>
    </PageFrame>
  );
});

TLSAnalysisPage.displayName = "TLSAnalysisPage";

export default TLSAnalysisPage;

