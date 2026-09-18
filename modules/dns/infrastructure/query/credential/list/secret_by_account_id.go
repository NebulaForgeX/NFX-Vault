package list

import (
	"context"
	"errors"

	"nfxvault/modules/dns/infrastructure/rdb/views"
	credQuery "nfxvault/modules/dns/query/credential"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) SecretByAccountID(ctx context.Context, accountID uuid.UUID) (*credQuery.SecretVO, error) {
	var row views.NamecheapCredentialsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapCredentialsActiveView{}.TableName()).
		Where("account_id = ?", accountID).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &credQuery.SecretVO{CredentialVO: toVO(row), APIKey: row.APIKey}, nil
}
