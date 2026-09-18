package update

import (
	"context"

	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/modules/dns/infrastructure/repository/credential/mapper"
)

func (h *Handler) Generic(ctx context.Context, c *credDomain.Credential) error {
	return h.db.WithContext(ctx).Save(mapper.CredentialDomainToModel(c)).Error
}
