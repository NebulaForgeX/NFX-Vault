package http

import (
	analysisapp "nfxvault/modules/analysis/application/analysis"
	systemapp "nfxvault/modules/analysis/application/system"
	"nfxvault/modules/analysis/interfaces/http/handler"
)

type Registry struct {
	App      *handler.SystemHandler
	Analysis *handler.AnalysisHandler
	I18n     *handler.I18nHandler
}

func NewRegistry(sys *systemapp.Service, analysis *analysisapp.Service, langs string) *Registry {
	return &Registry{App: handler.NewSystemHandler(sys), Analysis: handler.NewAnalysisHandler(analysis), I18n: handler.NewI18nHandler(langs)}
}
