package list

import (
	"nfxvault/modules/dns/infrastructure/rdb/views"
	credQuery "nfxvault/modules/dns/query/credential"
)

func toVO(r views.NamecheapCredentialsActiveView) credQuery.CredentialVO {
	return credQuery.CredentialVO{
		ID:               r.ID,
		AccountID:        r.AccountID,
		ProfileID:        r.ProfileID,
		APIUser:          r.APIUser,
		UserName:         r.UserName,
		ClientIP:         r.ClientIP,
		Sandbox:          r.Sandbox,
		HasAPIKey:        r.APIKey != "",
		LastVerifiedAt:   r.LastVerifiedAt,
		LastErrorMessage: r.LastErrorMessage,
		CreatedAt:        r.CreatedAt,
		UpdatedAt:        r.UpdatedAt,
	}
}
