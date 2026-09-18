package get

import (
	"context"

	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/rdb/models"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/mapper"

	"github.com/google/uuid"
)

func (h *Handler) ByAccountID(ctx context.Context, accountID uuid.UUID) ([]*ddnsDomain.Host, error) {
	var rows []models.NamecheapDdnsHost
	if err := h.db.WithContext(ctx).Where("account_id = ?", accountID).Order("domain, host").Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]*ddnsDomain.Host, 0, len(rows))
	for i := range rows {
		out = append(out, mapper.HostModelToDomain(&rows[i]))
	}
	return out, nil
}
