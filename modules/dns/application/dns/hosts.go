package dns

import (
	"context"

	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/dns/commands"
	"nfxvault/modules/dns/application/dns/results"
)

func (s *Service) GetHosts(ctx context.Context, cmd commands.GetHostsCmd) (*results.HostsRO, error) {
	domain := normalizeDomain(cmd.Domain)
	if domain == "" {
		return nil, dnsErr.ErrInvalidDomain
	}
	cred, err := s.ncCred(ctx, cmd.AccountID)
	if err != nil {
		return nil, err
	}
	row, err := s.nc.GetHosts(ctx, cred, domain)
	if err != nil {
		return nil, err
	}
	return results.HostsMapper(row), nil
}
