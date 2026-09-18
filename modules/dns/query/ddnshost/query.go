package ddnshost

import (
	"context"

	"github.com/google/uuid"
)

type Query struct {
	List List
}

type List interface {
	ByAccountID(ctx context.Context, accountID uuid.UUID) ([]HostVO, error)
	ByAccountDomain(ctx context.Context, accountID uuid.UUID, domain string) ([]HostVO, error)
	SecretByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (*SecretVO, error)
}
