package ddnshost

import (
	"errors"
	"strings"

	"nfxvault/connections/namecheap"
	dnsErr "nfxvault/errors/src/dns"
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	repofactory "nfxvault/modules/dns/infrastructure/repository/factory"
	credQuery "nfxvault/modules/dns/query/credential"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"
	"nfxvault/pkgs/errx"
	"nfxvault/pkgs/transaction"

	"github.com/google/uuid"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	credQuery   *credQuery.Query
	ddnsQuery   *ddnsQuery.Query
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	credQuery *credQuery.Query,
	ddnsQuery *ddnsQuery.Query,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, credQuery: credQuery, ddnsQuery: ddnsQuery}
}

func none() transaction.UoW { return transaction.UoW{} }

func isMissing(err error) bool {
	e := errx.AsError(err)
	return e != nil && e.Kind == errx.KindNotFound
}

func mapHostErr(err error) error {
	if err == nil {
		return nil
	}
	switch {
	case errors.Is(err, ddnsDomain.ErrDomainRequired),
		errors.Is(err, ddnsDomain.ErrInvalidDomain):
		return dnsErr.ErrInvalidDomain
	case errors.Is(err, ddnsDomain.ErrPasswordRequired),
		errors.Is(err, ddnsDomain.ErrAccountIDRequired):
		return dnsErr.ErrInvalidDdnsHost
	case errors.Is(err, ddnsDomain.ErrHostNotFound),
		errors.Is(err, ddnsDomain.ErrHostNotOwned):
		return dnsErr.ErrDdnsHostNotFound
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

func normalizeDomain(domain string) string {
	return strings.ToLower(strings.TrimSuffix(strings.TrimSpace(domain), "."))
}

func requireDomain(domain string) error {
	if domain == "" {
		return dnsErr.ErrInvalidDomain
	}
	if _, _, err := namecheap.SplitDomain(domain); err != nil {
		return dnsErr.ErrInvalidDomain
	}
	return nil
}
