package credential

import (
	"context"

	"github.com/google/uuid"
)

type Query struct {
	List List
}

type List interface {
	ByAccountID(ctx context.Context, accountID uuid.UUID) (*CredentialVO, error)
	SecretByAccountID(ctx context.Context, accountID uuid.UUID) (*SecretVO, error)
}
