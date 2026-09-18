package ddnshost

import (
	"context"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/ddnshost/commands"
	"nfxvault/modules/dns/application/ddnshost/results"
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

func (s *Service) UpsertHost(ctx context.Context, cmd commands.UpsertHostCmd) (*results.HostRO, error) {
	cmd.Domain = normalizeDomain(cmd.Domain)
	cmd.Host = namecheap.NormalizeHost(cmd.Host)
	if err := requireDomain(cmd.Domain); err != nil {
		return nil, err
	}
	credRow, err := s.credQuery.List.ByAccountID(ctx, cmd.AccountID)
	if err != nil {
		return nil, err
	}
	var credID *uuid.UUID
	if credRow != nil {
		id := credRow.ID
		credID = &id
	}
	existing, err := s.repoFactory.DdnsHost(none()).Get.ByAccountDomainHost(ctx, cmd.AccountID, cmd.Domain, cmd.Host)
	if err != nil && !isMissing(err) {
		return nil, err
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		repo := s.repoFactory.DdnsHost(uow)
		if existing == nil {
			created, cerr := ddnsDomain.NewHost(ddnsDomain.NewHostParams{
				AccountID:    cmd.AccountID,
				ProfileID:    profilePtr(cmd.ProfileID),
				CredentialID: credID,
				Domain:       cmd.Domain,
				Host:         cmd.Host,
				DDNSPassword: cmd.DDNSPassword,
			})
			if cerr != nil {
				return mapHostErr(cerr)
			}
			return repo.Create.New(ctx, created)
		}
		if aerr := existing.ApplyPassword(cmd.DDNSPassword); aerr != nil {
			return mapHostErr(aerr)
		}
		existing.BindCredential(credID)
		existing.BindProfile(profilePtr(cmd.ProfileID))
		return repo.Update.Generic(ctx, existing)
	})
	if err != nil {
		return nil, err
	}
	sec, err := s.ddnsQuery.List.SecretByAccountDomainHost(ctx, cmd.AccountID, cmd.Domain, cmd.Host)
	if err != nil {
		return nil, err
	}
	if sec == nil {
		return nil, dnsErr.ErrDdnsHostNotFound
	}
	ro := results.HostMapper(sec.HostVO)
	return &ro, nil
}
