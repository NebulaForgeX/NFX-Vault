package http

import (
	authconn "nfxvault/connections/auth"
	credapp "nfxvault/modules/dns/application/credential"
	ddnsapp "nfxvault/modules/dns/application/ddnshost"
	dnsapp "nfxvault/modules/dns/application/dns"
	"nfxvault/modules/dns/interfaces/http/handler"
)

type Registry struct {
	Credential *handler.CredentialHandler
	DdnsHost   *handler.DdnsHostHandler
	DNS        *handler.DNSHandler
	I18n       *handler.I18nHandler
}

func NewRegistry(
	credSvc *credapp.Service,
	ddnsSvc *ddnsapp.Service,
	dnsSvc *dnsapp.Service,
	langs string,
	identity *authconn.Client,
) *Registry {
	return &Registry{
		Credential: handler.NewCredentialHandler(credSvc, identity),
		DdnsHost:   handler.NewDdnsHostHandler(ddnsSvc, identity),
		DNS:        handler.NewDNSHandler(dnsSvc, identity),
		I18n:       handler.NewI18nHandler(langs),
	}
}
