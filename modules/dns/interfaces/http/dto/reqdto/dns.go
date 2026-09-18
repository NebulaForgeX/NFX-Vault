package reqdto

import (
	dnsCommands "nfxvault/modules/dns/application/dns/commands"

	"github.com/google/uuid"
)

type HostsGetRequestDTO struct {
	Domain string `query:"domain"`
}

type ARecordItemRequestDTO struct {
	Domain string `json:"domain"`
	Host   string `json:"host"`
}

type ARecordsUpdateRequestDTO struct {
	IP    string                  `json:"ip"`
	Items []ARecordItemRequestDTO `json:"items"`
}

func (r *ARecordsUpdateRequestDTO) ToUpdateCmd(accountID uuid.UUID) dnsCommands.UpdateARecordsCmd {
	items := make([]dnsCommands.ARecordItemCmd, 0, len(r.Items))
	for _, it := range r.Items {
		items = append(items, dnsCommands.ARecordItemCmd{Domain: it.Domain, Host: it.Host})
	}
	return dnsCommands.UpdateARecordsCmd{AccountID: accountID, IP: r.IP, Items: items}
}
