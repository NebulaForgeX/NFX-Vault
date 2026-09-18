package delete

import (
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) ddnsDomain.Delete { return &Handler{db: db} }
