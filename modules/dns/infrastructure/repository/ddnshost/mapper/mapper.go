package mapper

import (
	ddnsDomain "nfxvault/modules/dns/domain/ddnshost"
	"nfxvault/modules/dns/infrastructure/rdb/models"
)

func HostDomainToModel(h *ddnsDomain.Host) *models.NamecheapDdnsHost {
	if h == nil {
		return nil
	}
	st := h.State()
	return &models.NamecheapDdnsHost{
		ID:               st.ID,
		AccountID:        st.AccountID,
		ProfileID:        st.ProfileID,
		CredentialID:     st.CredentialID,
		Domain:           st.Domain,
		Host:             st.Host,
		DdnsPassword:     st.DDNSPassword,
		LastIpv4:         st.LastIPv4,
		LastSyncedAt:     st.LastSyncedAt,
		LastErrorMessage: st.LastErrorMessage,
		CreatedAt:        st.CreatedAt,
		UpdatedAt:        st.UpdatedAt,
	}
}

func HostModelToDomain(m *models.NamecheapDdnsHost) *ddnsDomain.Host {
	if m == nil {
		return nil
	}
	return ddnsDomain.NewHostFromState(ddnsDomain.HostState{
		ID:               m.ID,
		AccountID:        m.AccountID,
		ProfileID:        m.ProfileID,
		CredentialID:     m.CredentialID,
		Domain:           m.Domain,
		Host:             m.Host,
		DDNSPassword:     m.DdnsPassword,
		LastIPv4:         m.LastIpv4,
		LastSyncedAt:     m.LastSyncedAt,
		LastErrorMessage: m.LastErrorMessage,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	})
}
