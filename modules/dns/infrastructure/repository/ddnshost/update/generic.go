package update

import (
	"context"

	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/mapper"
)

func (h *Handler) Generic(ctx context.Context, row *ddnsDomain.Host) error {
	return h.db.WithContext(ctx).Save(mapper.HostDomainToModel(row)).Error
}
