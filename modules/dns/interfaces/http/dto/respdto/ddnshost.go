package respdto

import (
	"time"

	ddnsResults "nfxvault/modules/dns/application/ddnshost/results"
)

type DdnsHostDTO struct {
	ID               string     `json:"id"`
	AccountID        string     `json:"account_id"`
	ProfileID        *string    `json:"profile_id,omitempty"`
	CredentialID     *string    `json:"credential_id,omitempty"`
	Domain           string     `json:"domain"`
	Host             string     `json:"host"`
	HasDDNSPassword  bool       `json:"has_ddns_password"`
	LastIPv4         *string    `json:"last_ipv4,omitempty"`
	LastSyncedAt     *time.Time `json:"last_synced_at,omitempty"`
	LastErrorMessage *string    `json:"last_error_message,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func DdnsHostROToDTO(ro *ddnsResults.HostRO) *DdnsHostDTO {
	if ro == nil {
		return nil
	}
	dto := &DdnsHostDTO{
		ID:               ro.ID.String(),
		AccountID:        ro.AccountID.String(),
		Domain:           ro.Domain,
		Host:             ro.Host,
		HasDDNSPassword:  ro.HasDDNSPassword,
		LastIPv4:         ro.LastIPv4,
		LastSyncedAt:     ro.LastSyncedAt,
		LastErrorMessage: ro.LastErrorMessage,
		CreatedAt:        ro.CreatedAt,
		UpdatedAt:        ro.UpdatedAt,
	}
	if ro.ProfileID != nil {
		id := ro.ProfileID.String()
		dto.ProfileID = &id
	}
	if ro.CredentialID != nil {
		id := ro.CredentialID.String()
		dto.CredentialID = &id
	}
	return dto
}

func DdnsHostListToDTO(rows []ddnsResults.HostRO) []DdnsHostDTO {
	out := make([]DdnsHostDTO, 0, len(rows))
	for i := range rows {
		if dto := DdnsHostROToDTO(&rows[i]); dto != nil {
			out = append(out, *dto)
		}
	}
	return out
}

type DdnsHostListDTO struct {
	Items []DdnsHostDTO `json:"items"`
}

func DdnsHostCommandROToDTO(ro ddnsResults.CommandRO) CommandDTO {
	return CommandDTO{Success: ro.Success, Message: ro.Message}
}
