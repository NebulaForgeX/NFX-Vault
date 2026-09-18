package credential

import (
	"context"

	"nfxvault/modules/dns/application/credential/commands"
	"nfxvault/modules/dns/application/credential/results"
	"nfxvault/pkgs/transaction"
)

func (s *Service) DeleteCredential(ctx context.Context, cmd commands.DeleteCredentialCmd) (results.CommandRO, error) {
	err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Credential(uow).Delete.ByAccountID(ctx, cmd.AccountID)
	})
	if err != nil {
		return results.CommandRO{}, err
	}
	return results.CommandRO{Success: true, Message: "credential deleted"}, nil
}
