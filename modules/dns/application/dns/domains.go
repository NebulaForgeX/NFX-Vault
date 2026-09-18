package dns

import (
	"context"

	"nfxvault/modules/dns/application/dns/commands"
	"nfxvault/modules/dns/application/dns/results"
)

func (s *Service) ListDomains(ctx context.Context, cmd commands.ListDomainsCmd) ([]results.DomainRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID)
	if err != nil {
		return nil, err
	}
	items, err := s.nc.GetAllDomains(ctx, cred)
	if err != nil {
		return nil, err
	}
	return results.DomainsMapper(items), nil
}
