package ddnshost

import (
	"nfxvault/modules/dns/infrastructure/query/ddnshost/list"
	ddnsQuery "nfxvault/modules/dns/query/ddnshost"

	"gorm.io/gorm"
)

func NewQuery(db *gorm.DB) *ddnsQuery.Query {
	return &ddnsQuery.Query{List: list.NewHandler(db)}
}
