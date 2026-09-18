package credential

import (
	"nfxvault/modules/dns/infrastructure/query/credential/list"
	credQuery "nfxvault/modules/dns/query/credential"

	"gorm.io/gorm"
)

func NewQuery(db *gorm.DB) *credQuery.Query {
	return &credQuery.Query{List: list.NewHandler(db)}
}
