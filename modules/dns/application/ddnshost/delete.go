package ddnshost

import (
	"context"

	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/ddnshost/commands"
	"nfxvault/modules/dns/application/ddnshost/results"
	"nfxvault/pkgs/transaction"
)

func (s *Service) DeleteHost(ctx context.Context, cmd commands.DeleteHostCmd) (results.CommandRO, error) {
	row, err := s.repoFactory.DdnsHost(none()).Get.ByID(ctx, cmd.ID)
	if err != nil {
		return results.CommandRO{}, err
	}
	if row.AccountID() != cmd.AccountID {
		return results.CommandRO{}, dnsErr.ErrDdnsHostNotFound
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.DdnsHost(uow).Delete.ByID(ctx, cmd.ID)
	})
	if err != nil {
		return results.CommandRO{}, err
	}
	return results.CommandRO{Success: true, Message: "ddns host deleted"}, nil
}
