package results

import (
	"time"

	credQuery "nfxvault/modules/dns/query/credential"

	"github.com/google/uuid"
)

type CredentialRO struct {
	ID               uuid.UUID
	AccountID        uuid.UUID
	ProfileID        *uuid.UUID
	APIUser          string
	UserName         string
	ClientIP         string
	Sandbox          bool
	HasAPIKey        bool
	LastVerifiedAt   *time.Time
	LastErrorMessage *string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func CredentialMapper(vo *credQuery.CredentialVO) CredentialRO {
	if vo == nil {
		return CredentialRO{}
	}
	return CredentialRO{
		ID:               vo.ID,
		AccountID:        vo.AccountID,
		ProfileID:        vo.ProfileID,
		APIUser:          vo.APIUser,
		UserName:         vo.UserName,
		ClientIP:         vo.ClientIP,
		Sandbox:          vo.Sandbox,
		HasAPIKey:        vo.HasAPIKey,
		LastVerifiedAt:   vo.LastVerifiedAt,
		LastErrorMessage: vo.LastErrorMessage,
		CreatedAt:        vo.CreatedAt,
		UpdatedAt:        vo.UpdatedAt,
	}
}

type CommandRO struct {
	Success bool
	Message string
}
