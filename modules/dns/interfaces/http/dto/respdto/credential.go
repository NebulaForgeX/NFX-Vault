package respdto

import (
	"time"

	credResults "nfxvault/modules/dns/application/credential/results"
)

type CredentialDTO struct {
	ID               string     `json:"id"`
	AccountID        string     `json:"account_id"`
	ProfileID        *string    `json:"profile_id,omitempty"`
	APIUser          string     `json:"api_user"`
	UserName         string     `json:"user_name"`
	ClientIP         string     `json:"client_ip"`
	Sandbox          bool       `json:"sandbox"`
	HasAPIKey        bool       `json:"has_api_key"`
	LastVerifiedAt   *time.Time `json:"last_verified_at,omitempty"`
	LastErrorMessage *string    `json:"last_error_message,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func CredentialROToDTO(ro *credResults.CredentialRO) *CredentialDTO {
	if ro == nil {
		return nil
	}
	dto := &CredentialDTO{
		ID:               ro.ID.String(),
		AccountID:        ro.AccountID.String(),
		APIUser:          ro.APIUser,
		UserName:         ro.UserName,
		ClientIP:         ro.ClientIP,
		Sandbox:          ro.Sandbox,
		HasAPIKey:        ro.HasAPIKey,
		LastVerifiedAt:   ro.LastVerifiedAt,
		LastErrorMessage: ro.LastErrorMessage,
		CreatedAt:        ro.CreatedAt,
		UpdatedAt:        ro.UpdatedAt,
	}
	if ro.ProfileID != nil {
		id := ro.ProfileID.String()
		dto.ProfileID = &id
	}
	return dto
}

type CommandDTO struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func CommandROToDTO(ro credResults.CommandRO) CommandDTO {
	return CommandDTO{Success: ro.Success, Message: ro.Message}
}
