package certificate

import (
	"context"
	"encoding/json"
	"time"
)

type CertificateVO struct {
	ID               string          `json:"id"`
	AccountID        *string         `json:"account_id,omitempty"`
	ProfileID        *string         `json:"profile_id,omitempty"`
	Domain           string          `json:"domain"`
	FolderName       *string         `json:"folder_name"`
	Status           string          `json:"status"`
	Email            *string         `json:"email"`
	Certificate      *string         `json:"certificate,omitempty"`
	PrivateKey       *string         `json:"private_key,omitempty"`
	SANs             json.RawMessage `json:"sans"`
	Issuer           *string         `json:"issuer"`
	NotBefore        *time.Time      `json:"not_before"`
	NotAfter         *time.Time      `json:"not_after"`
	IsValid          *bool           `json:"is_valid"`
	DaysRemaining    *int            `json:"days_remaining"`
	SANsChanged      bool            `json:"sans_changed"`
	LastErrorMessage *string         `json:"last_error_message"`
	LastErrorTime    *time.Time      `json:"last_error_time"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

type Query struct{ List List }

type List interface {
	Page(ctx context.Context, accountID, keyword string, offset, limit int, stripSecrets bool) ([]CertificateVO, int64, error)
	ByID(ctx context.Context, id string) (*CertificateVO, error)
	ByDomain(ctx context.Context, domain string) (*CertificateVO, error)
	All(ctx context.Context) ([]CertificateVO, error)
}
