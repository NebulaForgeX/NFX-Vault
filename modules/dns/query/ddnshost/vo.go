package ddnshost

import (
	"time"

	"github.com/google/uuid"
)

type HostVO struct {
	ID               uuid.UUID  `json:"id"`
	AccountID        uuid.UUID  `json:"account_id"`
	ProfileID        *uuid.UUID `json:"profile_id,omitempty"`
	CredentialID     *uuid.UUID `json:"credential_id,omitempty"`
	Domain           string     `json:"domain"`
	Host             string     `json:"host"`
	HasDDNSPassword  bool       `json:"has_ddns_password"`
	LastIPv4         *string    `json:"last_ipv4,omitempty"`
	LastSyncedAt     *time.Time `json:"last_synced_at,omitempty"`
	LastErrorMessage *string    `json:"last_error_message,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type SecretVO struct {
	HostVO
	DDNSPassword string
}
