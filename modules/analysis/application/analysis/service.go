package analysisapp

import (
	"strings"

	pemx "nfxvault/modules/tls/infrastructure/pem"
)

type Service struct{}

func NewService() *Service { return &Service{} }

type KeyInfo struct {
	HasPrivateKey bool `json:"has_private_key"`
	KeyLength     *int `json:"key_length"`
}

type Summary struct {
	IsValid       bool  `json:"is_valid"`
	DaysRemaining int   `json:"days_remaining"`
	HasPrivateKey bool  `json:"has_private_key"`
	KeyValid      *bool `json:"key_valid"`
}

type TLSData struct {
	Certificate *pemx.CertInfo `json:"certificate"`
	PrivateKey  KeyInfo        `json:"private_key"`
	Summary     Summary        `json:"summary"`
}

type TLSResult struct {
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Data    *TLSData `json:"data"`
}

func (s *Service) AnalyzeTLS(certificate, privateKey string) TLSResult {
	if strings.TrimSpace(certificate) == "" {
		return TLSResult{Success: false, Message: "Certificate content is empty"}
	}
	info, err := pemx.Parse(certificate)
	if err != nil {
		return TLSResult{Success: false, Message: "Failed to parse certificate. Please check PEM format."}
	}
	hasKey := strings.TrimSpace(privateKey) != ""
	var keyValid *bool
	if hasKey {
		v := true
		keyValid = &v
	}
	return TLSResult{
		Success: true,
		Message: "Certificate analyzed successfully",
		Data: &TLSData{
			Certificate: info,
			PrivateKey:  KeyInfo{HasPrivateKey: hasKey},
			Summary: Summary{
				IsValid: info.IsValid, DaysRemaining: info.DaysRemaining,
				HasPrivateKey: hasKey, KeyValid: keyValid,
			},
		},
	}
}
