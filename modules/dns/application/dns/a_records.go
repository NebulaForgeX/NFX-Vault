package dns

import (
	"context"
	"fmt"
	"net"
	"strings"
	"time"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/dns/commands"
	"nfxvault/modules/dns/application/dns/results"
	"nfxvault/pkgs/errx"

	"github.com/google/uuid"
)

const (
	aUpdateMethodDDNS     = "ddns"
	aUpdateMethodSetHosts = "set_hosts"
	msgUpdatedDDNS        = "updated via dynamic dns"
	msgUpdatedSetHosts    = "updated via namecheap setHosts"
)

func requireIPv4(ip string) error {
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil || parsed.To4() == nil {
		return dnsErr.ErrInvalidIPv4
	}
	return nil
}

func itemMessage(err error) string {
	if e := errx.AsError(err); e != nil && e.Message != "" {
		return e.Message
	}
	return dnsErr.ErrARecordUpdateFailed.Message
}

func (s *Service) UpdateARecords(ctx context.Context, cmd commands.UpdateARecordsCmd) (results.UpdateARecordsRO, error) {
	ip := strings.TrimSpace(cmd.IP)
	if err := requireIPv4(ip); err != nil {
		return results.UpdateARecordsRO{}, err
	}
	if len(cmd.Items) == 0 {
		return results.UpdateARecordsRO{}, dnsErr.ErrInvalidARecordItems
	}
	out := results.UpdateARecordsRO{IP: ip, Items: make([]results.ARecordRO, 0, len(cmd.Items))}
	okCount := 0
	for _, it := range cmd.Items {
		res := s.updateOneA(ctx, cmd.AccountID, normalizeDomain(it.Domain), namecheap.NormalizeHost(it.Host), ip)
		if res.Success {
			okCount++
		}
		out.Items = append(out.Items, res)
	}
	out.Success = okCount == len(cmd.Items)
	if out.Success {
		out.Message = fmt.Sprintf("updated %d A record(s)", okCount)
	} else {
		out.Message = fmt.Sprintf("updated %d/%d A record(s)", okCount, len(cmd.Items))
	}
	return out, nil
}

func (s *Service) updateOneA(ctx context.Context, accountID uuid.UUID, domain, host, ip string) results.ARecordRO {
	res := results.ARecordRO{Domain: domain, Host: host}
	if domain == "" {
		res.Message = dnsErr.ErrInvalidDomain.Message
		return res
	}
	ddns, err := s.ddnsQuery.List.SecretByAccountDomainHost(ctx, accountID, domain, host)
	if err != nil {
		res.Message = itemMessage(err)
		return res
	}
	if ddns != nil && ddns.DDNSPassword != "" {
		res.Method = aUpdateMethodDDNS
		row, gerr := s.repoFactory.DdnsHost(none()).Get.ByID(ctx, ddns.ID)
		if gerr != nil {
			res.Message = itemMessage(gerr)
			return res
		}
		if err := s.nc.UpdateDDNS(ctx, domain, host, ddns.DDNSPassword, ip); err != nil {
			row.RecordError(err.Error())
			_ = s.repoFactory.DdnsHost(none()).Update.Generic(ctx, row)
			res.Message = dnsErr.ErrARecordUpdateFailed.Message
			return res
		}
		row.MarkSynced(ip, time.Now().UTC())
		_ = s.repoFactory.DdnsHost(none()).Update.Generic(ctx, row)
		res.Success = true
		res.Message = msgUpdatedDDNS
		return res
	}
	res.Method = aUpdateMethodSetHosts
	cred, err := s.ncCred(ctx, accountID)
	if err != nil {
		res.Message = itemMessage(err)
		return res
	}
	if err := s.nc.UpdateARecord(ctx, cred, domain, host, ip); err != nil {
		res.Message = dnsErr.ErrARecordUpdateFailed.Message
		return res
	}
	res.Success = true
	res.Message = msgUpdatedSetHosts
	return res
}
