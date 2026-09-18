package list

import (
	"nfxvault/modules/dns/infrastructure/rdb/views"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"
)

func toVO(r views.NamecheapDdnsHostsActiveView) ddnsQuery.HostVO {
	return ddnsQuery.HostVO{
		ID:               r.ID,
		AccountID:        r.AccountID,
		ProfileID:        r.ProfileID,
		CredentialID:     r.CredentialID,
		Domain:           r.Domain,
		Host:             r.Host,
		HasDDNSPassword:  r.DDNSPassword != "",
		LastIPv4:         r.LastIPv4,
		LastSyncedAt:     r.LastSyncedAt,
		LastErrorMessage: r.LastErrorMessage,
		CreatedAt:        r.CreatedAt,
		UpdatedAt:        r.UpdatedAt,
	}
}
