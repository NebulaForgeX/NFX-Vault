package get

import (
	"context"
	"errors"

	dnsErr "nfxvault/errors/src/dns"
	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/modules/dns/infrastructure/rdb/models"
	"nfxvault/modules/dns/infrastructure/repository/credential/mapper"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) ByAccountID(ctx context.Context, accountID uuid.UUID) (*credDomain.Credential, error) {
	var m models.NamecheapCredential
	if err := h.db.WithContext(ctx).Where("account_id = ?", accountID).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, dnsErr.ErrNamecheapCredentialNotFound
		}
		return nil, err
	}
	return mapper.CredentialModelToDomain(&m), nil
}
