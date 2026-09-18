package ddnshost

import (
	"time"

	"github.com/google/uuid"
)

type Host struct {
	state HostState
}

type HostState struct {
	ID               uuid.UUID
	AccountID        uuid.UUID
	ProfileID        *uuid.UUID
	CredentialID     *uuid.UUID
	Domain           string
	Host             string
	DDNSPassword     string
	LastIPv4         *string
	LastSyncedAt     *time.Time
	LastErrorMessage *string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
