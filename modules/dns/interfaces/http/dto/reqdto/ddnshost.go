package reqdto

import (
	ddnsCommands "nfxvault/modules/dns/application/ddnshost/commands"

	"github.com/google/uuid"
)

type DdnsHostUpsertRequestDTO struct {
	Domain       string `json:"domain"`
	Host         string `json:"host"`
	DDNSPassword string `json:"ddns_password"`
}

func (r *DdnsHostUpsertRequestDTO) ToUpsertCmd(accountID, profileID uuid.UUID) ddnsCommands.UpsertHostCmd {
	return ddnsCommands.UpsertHostCmd{
		AccountID:    accountID,
		ProfileID:    profileID,
		Domain:       r.Domain,
		Host:         r.Host,
		DDNSPassword: r.DDNSPassword,
	}
}

type DdnsHostDeleteRequestDTO struct {
	ID uuid.UUID `json:"id"`
}

type DdnsHostListRequestDTO struct {
	Domain string `query:"domain"`
}
