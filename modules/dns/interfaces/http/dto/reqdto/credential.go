package reqdto

import (
	credCommands "nfxvault/modules/dns/application/credential/commands"

	"github.com/google/uuid"
)

type CredentialUpsertRequestDTO struct {
	APIUser  string `json:"api_user"`
	UserName string `json:"user_name"`
	APIKey   string `json:"api_key"`
	ClientIP string `json:"client_ip"`
	Sandbox  bool   `json:"sandbox"`
}

func (r *CredentialUpsertRequestDTO) ToUpsertCmd(accountID, profileID uuid.UUID) credCommands.UpsertCredentialCmd {
	return credCommands.UpsertCredentialCmd{
		AccountID: accountID,
		ProfileID: profileID,
		APIUser:   r.APIUser,
		UserName:  r.UserName,
		APIKey:    r.APIKey,
		ClientIP:  r.ClientIP,
		Sandbox:   r.Sandbox,
	}
}
