package certificate

import "context"

type Repo struct {
	Create Create
	Get    Get
	Update Update
	Delete Delete
}

type Create interface {
	New(ctx context.Context, c *Certificate) error
	FirstOrCreateByDomain(ctx context.Context, c *Certificate) error
}

type Get interface {
	ByID(ctx context.Context, id string) (*Certificate, error)
	ByDomain(ctx context.Context, domain string) (*Certificate, error)
	All(ctx context.Context) ([]*Certificate, error)
}

type Update interface {
	Generic(ctx context.Context, c *Certificate) error
	Fields(ctx context.Context, id string, fields map[string]any) error
}

type Delete interface {
	ByID(ctx context.Context, id string) (int64, error)
}
