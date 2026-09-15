package http

import (
	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/modules/tls/interfaces/http/handler"
)

type Registry struct {
	App  *handler.TLSHandler
	I18n *handler.I18nHandler
}

func NewRegistry(svc *tlsapp.Service, langs string) *Registry {
	return &Registry{App: handler.NewTLSHandler(svc), I18n: handler.NewI18nHandler(langs)}
}
