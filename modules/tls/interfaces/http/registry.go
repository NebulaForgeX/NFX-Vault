package http

import (
	authconn "nfxvault/connections/auth"
	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/modules/tls/interfaces/http/handler"
)

type Registry struct {
	App  *handler.TLSHandler
	I18n *handler.I18nHandler
}

func NewRegistry(svc *tlsapp.Service, langs string, identity *authconn.Client) *Registry {
	return &Registry{App: handler.NewTLSHandler(svc, identity), I18n: handler.NewI18nHandler(langs)}
}
