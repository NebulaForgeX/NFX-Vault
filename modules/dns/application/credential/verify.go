package credential

import (
	"context"
	"time"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	"nfxvault/modules/dns/application/credential/commands"
	"nfxvault/modules/dns/application/credential/results"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

func (s *Service) ncCred(ctx context.Context, accountID uuid.UUID) (namecheap.Credentials, error) {
	sec, err := s.credQuery.List.SecretByAccountID(ctx, accountID)
	if err != nil {
		return namecheap.Credentials{}, err
	}
	if sec == nil || sec.APIKey == "" {
		return namecheap.Credentials{}, dnsErr.ErrNamecheapCredentialRequired
	}
	return namecheap.Credentials{
		APIUser:  sec.APIUser,
		UserName: sec.UserName,
		APIKey:   sec.APIKey,
		ClientIP: sec.ClientIP,
		Sandbox:  sec.Sandbox,
	}, nil
}

func (s *Service) persistVerify(ctx context.Context, accountID uuid.UUID, verifyAt *time.Time, errMsg *string) {
	row, err := s.repoFactory.Credential(none()).Get.ByAccountID(ctx, accountID)
	if err != nil || row == nil {
		return
	}
	if verifyAt != nil {
		row.MarkVerified(*verifyAt)
	} else if errMsg != nil {
		row.RecordError(*errMsg)
	}
	_ = s.repoFactory.Credential(transaction.UoW{}).Update.Generic(ctx, row)
}

func (s *Service) VerifyCredential(ctx context.Context, cmd commands.VerifyCredentialCmd) (results.CommandRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID)
	if err != nil {
		return results.CommandRO{}, err
	}
	_, _, err = s.nc.GetList(ctx, cred, 1, 20)
	now := time.Now().UTC()
	if err != nil {
		msg := err.Error()
		s.persistVerify(ctx, cmd.AccountID, nil, &msg)
		return results.CommandRO{Success: false, Message: msg}, nil
	}
	s.persistVerify(ctx, cmd.AccountID, &now, nil)
	return results.CommandRO{Success: true, Message: "Namecheap API connected"}, nil
}
