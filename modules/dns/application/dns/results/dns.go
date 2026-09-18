package results

import "nfxvault/connections/namecheap"

type CommandRO struct {
	Success bool
	Message string
}

type DomainRO struct {
	ID        string
	Name      string
	Created   string
	Expires   string
	IsExpired string
	IsLocked  string
	AutoRenew string
	IsOurDNS  string
}

func DomainsMapper(rows []namecheap.Domain) []DomainRO {
	out := make([]DomainRO, 0, len(rows))
	for _, d := range rows {
		out = append(out, DomainRO{
			ID: d.ID, Name: d.Name, Created: d.Created, Expires: d.Expires,
			IsExpired: d.IsExpired, IsLocked: d.IsLocked, AutoRenew: d.AutoRenew, IsOurDNS: d.IsOurDNS,
		})
	}
	return out
}

type HostRO struct {
	HostID             string
	Name               string
	Type               string
	Address            string
	MXPref             string
	TTL                string
	AssociatedAppTitle string
	FriendlyName       string
	IsActive           string
	IsDDNSEnabled      string
}

type HostsRO struct {
	Domain    string
	EmailType string
	IsOurDNS  bool
	Hosts     []HostRO
}

func HostsMapper(row *namecheap.HostsResult) *HostsRO {
	if row == nil {
		return nil
	}
	hosts := make([]HostRO, 0, len(row.Hosts))
	for _, h := range row.Hosts {
		hosts = append(hosts, HostRO{
			HostID: h.HostID, Name: h.Name, Type: h.Type, Address: h.Address,
			MXPref: h.MXPref, TTL: h.TTL, AssociatedAppTitle: h.AssociatedAppTitle,
			FriendlyName: h.FriendlyName, IsActive: h.IsActive, IsDDNSEnabled: h.IsDDNSEnabled,
		})
	}
	return &HostsRO{Domain: row.Domain, EmailType: row.EmailType, IsOurDNS: row.IsOurDNS, Hosts: hosts}
}

type ARecordRO struct {
	Domain  string
	Host    string
	Method  string
	Success bool
	Message string
}

type UpdateARecordsRO struct {
	Success bool
	Message string
	IP      string
	Items   []ARecordRO
}

type OutboundIPRO struct {
	IPv4 string
}
