package ddnshost

import (
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/check"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/create"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/delete"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/get"
	"nfxvault/modules/dns/infrastructure/repository/ddnshost/update"

	"gorm.io/gorm"
)

func NewRepo(db *gorm.DB) *ddnsDomain.Repo {
	return &ddnsDomain.Repo{
		Create: create.NewHandler(db),
		Get:    get.NewHandler(db),
		Check:  check.NewHandler(db),
		Update: update.NewHandler(db),
		Delete: delete.NewHandler(db),
	}
}
