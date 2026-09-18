package create

import (
	"context"

	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/mapper"
)

func (h *Handler) New(ctx context.Context, row *ddnsDomain.Host) error {
	return h.db.WithContext(ctx).Create(mapper.HostDomainToModel(row)).Error
}
