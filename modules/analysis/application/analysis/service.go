package analysisapp

import (
	"strings"

	tlsapp "nfxvault/modules/tls/application/tls"
)

type Service struct{}

func NewService() *Service { return &Service{} }

func (s *Service) AnalyzeTLS(certificate, privateKey string) map[string]any {
	if strings.TrimSpace(certificate) == "" {
		return map[string]any{"success": false, "message": "Certificate content is empty", "data": nil}
	}
	info, err := tlsapp.ParsePEM(certificate)
	if err != nil {
		return map[string]any{"success": false, "message": "Failed to parse certificate. Please check PEM format.", "data": nil}
	}
	hasKey := strings.TrimSpace(privateKey) != ""
	keyInfo := map[string]any{"has_private_key": hasKey}
	var keyValid any
	if hasKey {
		keyValid = true
		keyInfo["key_length"] = nil
	}
	return map[string]any{
		"success": true,
		"message": "Certificate analyzed successfully",
		"data": map[string]any{
			"certificate": map[string]any{
				"domain":          info.CommonName,
				"subject":         info.Subject,
				"issuer":          info.Issuer,
				"sans":            info.SANs,
				"all_domains":     info.AllDomains,
				"not_before":      info.NotBefore,
				"not_after":       info.NotAfter,
				"is_valid":        info.IsValid,
				"days_remaining":  info.DaysRemaining,
			},
			"private_key": keyInfo,
			"summary": map[string]any{
				"is_valid":        info.IsValid,
				"days_remaining":  info.DaysRemaining,
				"has_private_key": hasKey,
				"key_valid":       keyValid,
			},
		},
	}
}
