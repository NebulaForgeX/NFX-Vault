package http

import (
	authconn "nfxvault/connections/auth"
	fileapp "nfxvault/modules/file/application/file"
	systemapp "nfxvault/modules/file/application/system"
	"nfxvault/modules/file/interfaces/http/handler"
)

type Registry struct {
	App  *handler.SystemHandler
	File *handler.FileHandler
	I18n *handler.I18nHandler
}

func NewRegistry(sys *systemapp.Service, files *fileapp.Service, langs string, identity *authconn.Client) *Registry {
	return &Registry{App: handler.NewSystemHandler(sys), File: handler.NewFileHandler(files, identity), I18n: handler.NewI18nHandler(langs)}
}
