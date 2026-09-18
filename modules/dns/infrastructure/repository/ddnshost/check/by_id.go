package check

import (
	"context"

	"nfxvault/modules/dns/infrastructure/rdb/models"

	"github.com/google/uuid"
)

func (h *Handler) ByID(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	if err := h.db.WithContext(ctx).Model(&models.NamecheapDdnsHost{}).Where("id = ?", id).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
