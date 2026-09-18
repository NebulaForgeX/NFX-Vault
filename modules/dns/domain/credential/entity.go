package credential

import (
	"time"

	"github.com/google/uuid"
)

type Credential struct {
	state CredentialState
}

type CredentialState struct {
	ID               uuid.UUID
	AccountID        uuid.UUID
	ProfileID        *uuid.UUID
	APIUser          string
	UserName         string
	APIKey           string
	ClientIP         string
	Sandbox          bool
	LastVerifiedAt   *time.Time
	LastErrorMessage *string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
