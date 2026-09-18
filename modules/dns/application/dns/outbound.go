package dns

import (
	"context"

	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/dns/results"
)

func (s *Service) OutboundIPv4(ctx context.Context) (results.OutboundIPRO, error) {
	ip, err := s.nc.OutboundIPv4(ctx)
	if err != nil {
		return results.OutboundIPRO{}, dnsErr.ErrOutboundIPFailed
	}
	return results.OutboundIPRO{IPv4: ip}, nil
}
