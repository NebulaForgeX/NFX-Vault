package list

import (
	"context"
	"errors"

	"nfxvault/modules/dns/infrastructure/rdb/views"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) SecretByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (*ddnsQuery.SecretVO, error) {
	var row views.NamecheapDdnsHostsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapDdnsHostsActiveView{}.TableName()).
		Where("account_id = ? AND domain = ? AND host = ?", accountID, domain, host).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &ddnsQuery.SecretVO{HostVO: toVO(row), DDNSPassword: row.DDNSPassword}, nil
}
