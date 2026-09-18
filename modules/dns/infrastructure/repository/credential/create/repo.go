package create

import (
	credDomain "nfxvault/modules/dns/domain/credential"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) credDomain.Create { return &Handler{db: db} }
