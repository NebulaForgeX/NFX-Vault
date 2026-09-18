package delete

import (
	"context"

	"nfxvault/modules/dns/infrastructure/rdb/models"

	"github.com/google/uuid"
)

func (h *Handler) ByAccountID(ctx context.Context, accountID uuid.UUID) error {
	return h.db.WithContext(ctx).Delete(&models.NamecheapCredential{}, "account_id = ?", accountID).Error
}
