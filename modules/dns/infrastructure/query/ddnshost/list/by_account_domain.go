package list

import (
	"context"

	"nfxvault/modules/dns/infrastructure/rdb/views"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"

	"github.com/google/uuid"
)

func (h *Handler) ByAccountDomain(ctx context.Context, accountID uuid.UUID, domain string) ([]ddnsQuery.HostVO, error) {
	var rows []views.NamecheapDdnsHostsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapDdnsHostsActiveView{}.TableName()).
		Where("account_id = ? AND domain = ?", accountID, domain).Order("host").Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]ddnsQuery.HostVO, 0, len(rows))
	for _, r := range rows {
		out = append(out, toVO(r))
	}
	return out, nil
}
