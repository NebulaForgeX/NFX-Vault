package factory

import (
	certDomain "nfxvault/modules/tls/domain/certificate"
	certRepo "nfxvault/modules/tls/infrastructure/repository/certificate"
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

func (f *TxRepoFactory) Certificate(uow transaction.UoW) *certDomain.Repo {
	return certRepo.NewRepo(f.dbOr(uow))
}
