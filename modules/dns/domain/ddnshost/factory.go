package ddnshost

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

type NewHostParams struct {
	AccountID    uuid.UUID
	ProfileID    *uuid.UUID
	CredentialID *uuid.UUID
	Domain       string
	Host         string
	DDNSPassword string
}

func NewHost(p NewHostParams) (*Host, error) {
	p.Domain = strings.ToLower(strings.TrimSuffix(strings.TrimSpace(p.Domain), "."))
	p.Host = strings.TrimSpace(p.Host)
	if p.Host == "" {
		p.Host = "@"
	}
	p.DDNSPassword = strings.TrimSpace(p.DDNSPassword)
	if err := validateNewHostParams(p); err != nil {
		return nil, err
	}
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	return NewHostFromState(HostState{
		ID:           id,
		AccountID:    p.AccountID,
		ProfileID:    p.ProfileID,
		CredentialID: p.CredentialID,
		Domain:       p.Domain,
		Host:         p.Host,
		DDNSPassword: p.DDNSPassword,
		CreatedAt:    now,
		UpdatedAt:    now,
	}), nil
}

func NewHostFromState(st HostState) *Host {
	return &Host{state: st}
}
