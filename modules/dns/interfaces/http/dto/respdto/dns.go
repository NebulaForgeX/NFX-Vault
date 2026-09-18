package respdto

import dnsResults "nfxvault/modules/dns/application/dns/results"

type DomainDTO struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Created   string `json:"created"`
	Expires   string `json:"expires"`
	IsExpired string `json:"is_expired"`
	IsLocked  string `json:"is_locked"`
	AutoRenew string `json:"auto_renew"`
	IsOurDNS  string `json:"is_our_dns"`
}

type DomainListDTO struct {
	Items []DomainDTO `json:"items"`
}

func DomainsROToDTO(rows []dnsResults.DomainRO) DomainListDTO {
	items := make([]DomainDTO, 0, len(rows))
	for _, d := range rows {
		items = append(items, DomainDTO{
			ID: d.ID, Name: d.Name, Created: d.Created, Expires: d.Expires,
			IsExpired: d.IsExpired, IsLocked: d.IsLocked, AutoRenew: d.AutoRenew, IsOurDNS: d.IsOurDNS,
		})
	}
	return DomainListDTO{Items: items}
}

type HostDTO struct {
	HostID             string `json:"host_id"`
	Name               string `json:"name"`
	Type               string `json:"type"`
	Address            string `json:"address"`
	MXPref             string `json:"mx_pref"`
	TTL                string `json:"ttl"`
	AssociatedAppTitle string `json:"associated_app_title"`
	FriendlyName       string `json:"friendly_name"`
	IsActive           string `json:"is_active"`
	IsDDNSEnabled      string `json:"is_ddns_enabled"`
}

type HostsDTO struct {
	Domain    string    `json:"domain"`
	EmailType string    `json:"email_type"`
	IsOurDNS  bool      `json:"is_our_dns"`
	Hosts     []HostDTO `json:"hosts"`
}

func HostsROToDTO(ro *dnsResults.HostsRO) *HostsDTO {
	if ro == nil {
		return nil
	}
	hosts := make([]HostDTO, 0, len(ro.Hosts))
	for _, h := range ro.Hosts {
		hosts = append(hosts, HostDTO{
			HostID: h.HostID, Name: h.Name, Type: h.Type, Address: h.Address,
			MXPref: h.MXPref, TTL: h.TTL, AssociatedAppTitle: h.AssociatedAppTitle,
			FriendlyName: h.FriendlyName, IsActive: h.IsActive, IsDDNSEnabled: h.IsDDNSEnabled,
		})
	}
	return &HostsDTO{Domain: ro.Domain, EmailType: ro.EmailType, IsOurDNS: ro.IsOurDNS, Hosts: hosts}
}

type ARecordDTO struct {
	Domain  string `json:"domain"`
	Host    string `json:"host"`
	Method  string `json:"method"`
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type UpdateARecordsDTO struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	IP      string       `json:"ip"`
	Items   []ARecordDTO `json:"items"`
}

func UpdateARecordsROToDTO(ro dnsResults.UpdateARecordsRO) UpdateARecordsDTO {
	items := make([]ARecordDTO, 0, len(ro.Items))
	for _, it := range ro.Items {
		items = append(items, ARecordDTO{
			Domain: it.Domain, Host: it.Host, Method: it.Method, Success: it.Success, Message: it.Message,
		})
	}
	return UpdateARecordsDTO{Success: ro.Success, Message: ro.Message, IP: ro.IP, Items: items}
}

type OutboundIPDTO struct {
	IPv4 string `json:"ipv4"`
}

func OutboundIPROToDTO(ro dnsResults.OutboundIPRO) OutboundIPDTO {
	return OutboundIPDTO{IPv4: ro.IPv4}
}
