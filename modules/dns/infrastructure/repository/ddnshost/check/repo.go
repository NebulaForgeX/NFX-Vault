package check

import (
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) ddnsDomain.Check { return &Handler{db: db} }
