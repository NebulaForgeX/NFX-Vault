package list

import (
	"context"
	"errors"

	"nfxvault/modules/dns/infrastructure/rdb/views"
	credQuery "nfxvault/modules/dns/query/credential"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) ByAccountID(ctx context.Context, accountID uuid.UUID) (*credQuery.CredentialVO, error) {
	var row views.NamecheapCredentialsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapCredentialsActiveView{}.TableName()).
		Where("account_id = ?", accountID).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	vo := toVO(row)
	return &vo, nil
}
