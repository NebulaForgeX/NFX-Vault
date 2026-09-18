package check

import (
	"context"

	"nfxvault/modules/dns/infrastructure/rdb/models"

	"github.com/google/uuid"
)

func (h *Handler) ByAccountID(ctx context.Context, accountID uuid.UUID) (bool, error) {
	var count int64
	if err := h.db.WithContext(ctx).Model(&models.NamecheapCredential{}).Where("account_id = ?", accountID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
