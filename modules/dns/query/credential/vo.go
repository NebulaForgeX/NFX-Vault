package credential

import (
	"time"

	"github.com/google/uuid"
)

type CredentialVO struct {
	ID               uuid.UUID  `json:"id"`
	AccountID        uuid.UUID  `json:"account_id"`
	ProfileID        *uuid.UUID `json:"profile_id,omitempty"`
	APIUser          string     `json:"api_user"`
	UserName         string     `json:"user_name"`
	ClientIP         string     `json:"client_ip"`
	Sandbox          bool       `json:"sandbox"`
	HasAPIKey        bool       `json:"has_api_key"`
	LastVerifiedAt   *time.Time `json:"last_verified_at,omitempty"`
	LastErrorMessage *string    `json:"last_error_message,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type SecretVO struct {
	CredentialVO
	APIKey string
}
