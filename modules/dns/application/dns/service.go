package dns

import (
	"context"
	"strings"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	repofactory "nfxvault/modules/dns/infrastructure/repository/factory"
	credQuery "nfxvault/modules/dns/query/credential"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	credQuery   *credQuery.Query
	ddnsQuery   *ddnsQuery.Query
	nc          *namecheap.Client
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	credQuery *credQuery.Query,
	ddnsQuery *ddnsQuery.Query,
	nc *namecheap.Client,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, credQuery: credQuery, ddnsQuery: ddnsQuery, nc: nc}
}

func none() transaction.UoW { return transaction.UoW{} }

func normalizeDomain(domain string) string {
	return strings.ToLower(strings.TrimSuffix(strings.TrimSpace(domain), "."))
}

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
