package credential

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
	New(ctx context.Context, c *Credential) error
}

type Get interface {
	ByID(ctx context.Context, id uuid.UUID) (*Credential, error)
	ByAccountID(ctx context.Context, accountID uuid.UUID) (*Credential, error)
}

type Check interface {
	ByID(ctx context.Context, id uuid.UUID) (bool, error)
	ByAccountID(ctx context.Context, accountID uuid.UUID) (bool, error)
}

type Update interface {
	Generic(ctx context.Context, c *Credential) error
}

type Delete interface {
	ByID(ctx context.Context, id uuid.UUID) error
	ByAccountID(ctx context.Context, accountID uuid.UUID) error
}
