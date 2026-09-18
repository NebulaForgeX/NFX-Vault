package credential

import (
	"errors"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	credDomain "nfxvault/modules/dns/domain/credential"
	repofactory "nfxvault/modules/dns/infrastructure/repository/factory"
	credQuery "nfxvault/modules/dns/query/credential"
	"nfxvault/pkgs/errx"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	credQuery   *credQuery.Query
	nc          *namecheap.Client
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	credQuery *credQuery.Query,
	nc *namecheap.Client,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, credQuery: credQuery, nc: nc}
}

func none() transaction.UoW { return transaction.UoW{} }

func isMissing(err error) bool {
	e := errx.AsError(err)
	return e != nil && e.Kind == errx.KindNotFound
}

func mapCredentialErr(err error) error {
	if err == nil {
		return nil
	}
	switch {
	case errors.Is(err, credDomain.ErrAPIUserRequired),
		errors.Is(err, credDomain.ErrAPIKeyRequired),
		errors.Is(err, credDomain.ErrClientIPRequired),
		errors.Is(err, credDomain.ErrInvalidClientIP),
		errors.Is(err, credDomain.ErrAccountIDRequired):
		return dnsErr.ErrInvalidNamecheapCredential
	default:
		return err
	}
}

func profilePtr(id uuid.UUID) *uuid.UUID {
	if id == uuid.Nil {
		return nil
	}
	v := id
	return &v
}
