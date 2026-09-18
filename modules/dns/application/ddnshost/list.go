package ddnshost

import (
	"context"

	"nfxvault/modules/dns/application/ddnshost/commands"
	"nfxvault/modules/dns/application/ddnshost/results"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"
)

func (s *Service) ListHosts(ctx context.Context, cmd commands.ListHostsCmd) ([]results.HostRO, error) {
	domain := normalizeDomain(cmd.Domain)
	var (
		rows []ddnsQuery.HostVO
		err  error
	)
	if domain != "" {
		rows, err = s.ddnsQuery.List.ByAccountDomain(ctx, cmd.AccountID, domain)
	} else {
		rows, err = s.ddnsQuery.List.ByAccountID(ctx, cmd.AccountID)
	}
	if err != nil {
		return nil, err
	}
	return results.HostsMapper(rows), nil
}
