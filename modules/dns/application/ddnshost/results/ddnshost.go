package results

import (
	"time"

	ddnsQuery "nfxvault/modules/dns/query/ddnshost"

	"github.com/google/uuid"
)

type HostRO struct {
	ID               uuid.UUID
	AccountID        uuid.UUID
	ProfileID        *uuid.UUID
	CredentialID     *uuid.UUID
	Domain           string
	Host             string
	HasDDNSPassword  bool
	LastIPv4         *string
	LastSyncedAt     *time.Time
	LastErrorMessage *string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func HostMapper(vo ddnsQuery.HostVO) HostRO {
	return HostRO{
		ID:               vo.ID,
		AccountID:        vo.AccountID,
		ProfileID:        vo.ProfileID,
		CredentialID:     vo.CredentialID,
		Domain:           vo.Domain,
		Host:             vo.Host,
		HasDDNSPassword:  vo.HasDDNSPassword,
		LastIPv4:         vo.LastIPv4,
		LastSyncedAt:     vo.LastSyncedAt,
		LastErrorMessage: vo.LastErrorMessage,
		CreatedAt:        vo.CreatedAt,
		UpdatedAt:        vo.UpdatedAt,
	}
}

func HostsMapper(rows []ddnsQuery.HostVO) []HostRO {
	out := make([]HostRO, 0, len(rows))
	for _, r := range rows {
		out = append(out, HostMapper(r))
	}
	return out
}

type CommandRO struct {
	Success bool
	Message string
}
