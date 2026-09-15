package tlsapp

import (
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"math"
	"strings"
	"time"
)

type CertInfo struct {
	CommonName     string         `json:"common_name"`
	Subject        map[string]any `json:"subject"`
	Issuer         string         `json:"issuer"`
	SANs           []string       `json:"sans"`
	AllDomains     []string       `json:"all_domains"`
	NotBefore      *time.Time     `json:"not_before"`
	NotAfter       *time.Time     `json:"not_after"`
	IsValid        bool           `json:"is_valid"`
	DaysRemaining  int            `json:"days_remaining"`
}

func ParsePEM(raw string) (*CertInfo, error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(raw)))
	if block == nil {
		return nil, errPEM
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, err
	}
	cn := cert.Subject.CommonName
	sans := append([]string{}, cert.DNSNames...)
	all := make([]string, 0, len(sans)+1)
	if cn != "" {
		all = append(all, cn)
	}
	for _, s := range sans {
		if s != "" && !contains(all, s) {
			all = append(all, s)
		}
	}
	nb, na := cert.NotBefore.UTC(), cert.NotAfter.UTC()
	days := int(math.Floor(time.Until(na).Hours() / 24))
	issuer := cert.Issuer.CommonName
	if issuer == "" && len(cert.Issuer.Organization) > 0 {
		issuer = cert.Issuer.Organization[0]
	}
	return &CertInfo{
		CommonName:    cn,
		Subject:       map[string]any{"CN": cn},
		Issuer:        issuer,
		SANs:          sans,
		AllDomains:    all,
		NotBefore:     &nb,
		NotAfter:      &na,
		IsValid:       time.Now().Before(na) && time.Now().After(nb.Add(-time.Minute)),
		DaysRemaining: days,
	}, nil
}

func contains(xs []string, v string) bool {
	for _, x := range xs {
		if strings.EqualFold(x, v) {
			return true
		}
	}
	return false
}

func sansJSON(sans []string) []byte {
	if sans == nil {
		sans = []string{}
	}
	b, _ := json.Marshal(sans)
	return b
}

var errPEM = errString("invalid PEM certificate")

type errString string

func (e errString) Error() string { return string(e) }
