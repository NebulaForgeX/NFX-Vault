package get

import (
	"context"
	"errors"

	dnsErr "nfxvault/errors/src/dns"
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/rdb/models"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/mapper"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) ByAccountDomainHost(ctx context.Context, accountID uuid.UUID, domain, host string) (*ddnsDomain.Host, error) {
	var m models.NamecheapDdnsHost
	if err := h.db.WithContext(ctx).Where("account_id = ? AND domain = ? AND host = ?", accountID, domain, host).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, dnsErr.ErrDdnsHostNotFound
		}
		return nil, err
	}
	return mapper.HostModelToDomain(&m), nil
}
