package mapper

import (
	credDomain "nfxvault/modules/dns/domain/credential"
	"nfxvault/modules/dns/infrastructure/rdb/models"
)

func CredentialDomainToModel(c *credDomain.Credential) *models.NamecheapCredential {
	if c == nil {
		return nil
	}
	st := c.State()
	return &models.NamecheapCredential{
		ID:               st.ID,
		AccountID:        st.AccountID,
		ProfileID:        st.ProfileID,
		APIUser:          st.APIUser,
		UserName:         st.UserName,
		APIKey:           st.APIKey,
		ClientIP:         st.ClientIP,
		Sandbox:          st.Sandbox,
		LastVerifiedAt:   st.LastVerifiedAt,
		LastErrorMessage: st.LastErrorMessage,
		CreatedAt:        st.CreatedAt,
		UpdatedAt:        st.UpdatedAt,
	}
}

func CredentialModelToDomain(m *models.NamecheapCredential) *credDomain.Credential {
	if m == nil {
		return nil
	}
	return credDomain.NewCredentialFromState(credDomain.CredentialState{
		ID:               m.ID,
		AccountID:        m.AccountID,
		ProfileID:        m.ProfileID,
		APIUser:          m.APIUser,
		UserName:         m.UserName,
		APIKey:           m.APIKey,
		ClientIP:         m.ClientIP,
		Sandbox:          m.Sandbox,
		LastVerifiedAt:   m.LastVerifiedAt,
		LastErrorMessage: m.LastErrorMessage,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	})
}
