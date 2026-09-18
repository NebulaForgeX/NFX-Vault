package ddnshost

import (
	"context"

	"github.com/google/uuid"
)

type Repo struct {
	Create Create
	Get    Get
	Check  Check
	Update Update
	Delete Delete
}

type Create interface {
	New(ctx context.Context, h *Host) error
}

type Get interface {
	ByID(ctx context.Context, id uuid.UUID) (*Host, error)
	ByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (*Host, error)
	ByAccountID(ctx context.Context, accountID uuid.UUID) ([]*Host, error)
}

type Check interface {
	ByID(ctx context.Context, id uuid.UUID) (bool, error)
	ByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (bool, error)
}

type Update interface {
	Generic(ctx context.Context, h *Host) error
}

type Delete interface {
	ByID(ctx context.Context, id uuid.UUID) error
}
