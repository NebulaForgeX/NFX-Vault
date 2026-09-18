package factory

import (
	credDomain "nfxvault/modules/dns/domain/credential"
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	credRepo "nfxvault/modules/dns/infrastructure/repository/credential"
	ddnsRepo "nfxvault/modules/dns/infrastructure/repository/ddnshost"
	"nfxvault/pkgs/transaction"

	"gorm.io/gorm"
)

type TxRepoFactory struct{ db *gorm.DB }

func NewTxRepoFactory(db *gorm.DB) *TxRepoFactory { return &TxRepoFactory{db: db} }

func (f *TxRepoFactory) dbOr(uow transaction.UoW) *gorm.DB {
	if uow.DB != nil {
		return uow.DB
	}
	return f.db
}

func (f *TxRepoFactory) Credential(uow transaction.UoW) *credDomain.Repo {
	return credRepo.NewRepo(f.dbOr(uow))
}

func (f *TxRepoFactory) DdnsHost(uow transaction.UoW) *ddnsDomain.Repo {
	return ddnsRepo.NewRepo(f.dbOr(uow))
}
