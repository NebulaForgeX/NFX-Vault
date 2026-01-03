import { memo, useState } from "react";
import { ArrowLeft, FileSearch, Upload } from "@/assets/icons/lucide";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "node_modules/react-i18next";

import type { AnalyzeTLSResponse } from "@/types";
import { AnalyzeTLS } from "@/apis/analysis.api";

import styles from "./styles.module.css";

const TLSAnalysisPage = memo(() => {
  const { t } = useTranslation("tlsAnalysis");
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState<AnalyzeTLSResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

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
      const response = await AnalyzeTLS({
        certificate: certificate.trim(),
        privateKey: privateKey.trim() || undefined,
      });
      setResult(response);
      if (!response.success)  setError(response.message);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to analyze certificate");
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
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>{t("title") || "TLS Certificate Analysis"}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Certificate (PEM)</h2>
            <div className={styles.uploadArea}>
              <label className={styles.uploadLabel}>
                <Upload size={20} />
                <span>Upload Certificate File</span>
                <input
                  type="file"
                  accept=".crt,.pem,.cert"
                  onChange={handleCertificateFileUpload}
                  className={styles.fileInput}
                />
              </label>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Paste certificate content here (PEM format)..."
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
              rows={10}
            />
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Private Key (PEM) - Optional</h2>
            <div className={styles.uploadArea}>
              <label className={styles.uploadLabel}>
                <Upload size={20} />
                <span>Upload Private Key File</span>
                <input
                  type="file"
                  accept=".key,.pem"
                  onChange={handlePrivateKeyFileUpload}
                  className={styles.fileInput}
                />
              </label>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Paste private key content here (PEM format)..."
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              rows={10}
            />
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !certificate.trim()}
              className={styles.analyzeBtn}
            >
              <FileSearch size={18} />
              {isLoading ? "Analyzing..." : "Analyze Certificate"}
            </button>
            <button onClick={handleClear} className={styles.clearBtn}>
              Clear
            </button>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          {result?.success && result.data && (
            <div className={styles.result}>
              <h2 className={styles.resultTitle}>Analysis Results</h2>
              
              <div className={styles.resultSection}>
                <h3>Summary</h3>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Valid:</span>
                  <span className={result.data.summary.isValid ? styles.valid : styles.invalid}>
                    {result.data.summary.isValid ? "Yes" : "No"}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Days Remaining:</span>
                  <span>{result.data.summary.daysRemaining ?? "N/A"}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Has Private Key:</span>
                  <span>{result.data.summary.hasPrivateKey ? "Yes" : "No"}</span>
                </div>
                {result.data.summary.keyValid !== null && (
                  <div className={styles.resultItem}>
                    <span className={styles.label}>Private Key Valid:</span>
                    <span className={result.data.summary.keyValid ? styles.valid : styles.invalid}>
                      {result.data.summary.keyValid ? "Yes" : "No"}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.resultSection}>
                <h3>Certificate Information</h3>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Domain:</span>
                  <span>{result.data.certificate.domain || "N/A"}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Issuer:</span>
                  <span>{result.data.certificate.issuer || "N/A"}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Not Before:</span>
                  <span>{result.data.certificate.notBefore || "N/A"}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.label}>Not After:</span>
                  <span>{result.data.certificate.notAfter || "N/A"}</span>
                </div>
                {result.data.certificate.allDomains && result.data.certificate.allDomains.length > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.label}>All Domains:</span>
                    <div className={styles.domainsList}>
                      {result.data.certificate.allDomains.map((domain, idx) => (
                        <span key={idx} className={styles.domainTag}>{domain}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TLSAnalysisPage.displayName = "TLSAnalysisPage";

export default TLSAnalysisPage;

