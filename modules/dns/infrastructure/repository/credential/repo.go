package credential

import (
	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/modules/dns/infrastructure/repository/credential/check"
	"nfxvault/modules/dns/infrastructure/repository/credential/create"
	"nfxvault/modules/dns/infrastructure/repository/credential/delete"
	"nfxvault/modules/dns/infrastructure/repository/credential/get"
	"nfxvault/modules/dns/infrastructure/repository/credential/update"

	"gorm.io/gorm"
)

func NewRepo(db *gorm.DB) *credDomain.Repo {
	return &credDomain.Repo{
		Create: create.NewHandler(db),
		Get:    get.NewHandler(db),
		Check:  check.NewHandler(db),
		Update: update.NewHandler(db),
		Delete: delete.NewHandler(db),
	}
}
