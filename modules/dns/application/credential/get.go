package credential

import (
	"context"

	"nfxvault/modules/dns/application/credential/results"

	"github.com/google/uuid"
)

func (s *Service) GetCredential(ctx context.Context, accountID uuid.UUID) (*results.CredentialRO, error) {
	vo, err := s.credQuery.List.ByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if vo == nil {
		return nil, nil
	}
	ro := results.CredentialMapper(vo)
	return &ro, nil
}
