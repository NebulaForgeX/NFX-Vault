package list

import (
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) ddnsQuery.List { return &Handler{db: db} }
