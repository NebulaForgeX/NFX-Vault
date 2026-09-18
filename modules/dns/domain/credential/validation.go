package credential

import (
	"net"

	"github.com/google/uuid"
)

func (c *Credential) Validate() error {
	if c.AccountID() == uuid.Nil {
		return ErrAccountIDRequired
	}
	if c.APIUser() == "" {
		return ErrAPIUserRequired
	}
	if c.APIKey() == "" {
		return ErrAPIKeyRequired
	}
	if c.ClientIP() == "" {
		return ErrClientIPRequired
	}
	return validateIPv4(c.ClientIP())
}

func validateIPv4(ip string) error {
	parsed := net.ParseIP(ip)
	if parsed == nil || parsed.To4() == nil {
		return ErrInvalidClientIP
	}
	return nil
}

func validateNewCredentialParams(p NewCredentialParams) error {
	if p.AccountID == uuid.Nil {
		return ErrAccountIDRequired
	}
	if p.APIUser == "" {
		return ErrAPIUserRequired
	}
	if p.APIKey == "" {
		return ErrAPIKeyRequired
	}
	if p.ClientIP == "" {
		return ErrClientIPRequired
	}
	return validateIPv4(p.ClientIP)
}
