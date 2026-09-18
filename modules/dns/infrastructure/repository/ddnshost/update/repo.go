package update

import (
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) ddnsDomain.Update { return &Handler{db: db} }
