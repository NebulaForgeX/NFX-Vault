package check

import (
	"context"

	"nfxvault/modules/dns/infrastructure/rdb/models"

	"github.com/google/uuid"
)

func (h *Handler) ByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (bool, error) {
	var count int64
	if err := h.db.WithContext(ctx).Model(&models.NamecheapDdnsHost{}).
		Where("account_id = ? AND domain = ? AND host = ?", accountID, domain, host).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
