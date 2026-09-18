package credential

import (
	"context"

	"nfxvault/modules/dns/application/credential/commands"
	"nfxvault/modules/dns/application/credential/results"
	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/pkgs/transaction"
)

func (s *Service) UpsertCredential(ctx context.Context, cmd commands.UpsertCredentialCmd) (*results.CredentialRO, error) {
	existing, err := s.repoFactory.Credential(none()).Get.ByAccountID(ctx, cmd.AccountID)
	if err != nil && !isMissing(err) {
		return nil, err
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		repo := s.repoFactory.Credential(uow)
		if existing == nil {
			created, cerr := credDomain.NewCredential(credDomain.NewCredentialParams{
				AccountID: cmd.AccountID,
				ProfileID: profilePtr(cmd.ProfileID),
				APIUser:   cmd.APIUser,
				UserName:  cmd.UserName,
				APIKey:    cmd.APIKey,
				ClientIP:  cmd.ClientIP,
				Sandbox:   cmd.Sandbox,
			})
			if cerr != nil {
				return mapCredentialErr(cerr)
			}
			return repo.Create.New(ctx, created)
		}
		if aerr := existing.ApplySecret(cmd.APIUser, cmd.UserName, cmd.APIKey, cmd.ClientIP, cmd.Sandbox); aerr != nil {
			return mapCredentialErr(aerr)
		}
		existing.BindProfile(profilePtr(cmd.ProfileID))
		return repo.Update.Generic(ctx, existing)
	})
	if err != nil {
		return nil, err
	}
	return s.GetCredential(ctx, cmd.AccountID)
}
