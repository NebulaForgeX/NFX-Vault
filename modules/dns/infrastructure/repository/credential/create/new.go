package create

import (
	"context"

	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/modules/dns/infrastructure/repository/credential/mapper"
)

func (h *Handler) New(ctx context.Context, c *credDomain.Credential) error {
	return h.db.WithContext(ctx).Create(mapper.CredentialDomainToModel(c)).Error
}
