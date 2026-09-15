package http

import (
	"nfxvault/pkgs/fiberx/middleware"
	"nfxvault/pkgs/security/token"

	"github.com/gofiber/fiber/v3"
)

type Router struct {
	app           fiber.Router
	tokenVerifier token.Verifier
	handlers      *Registry
}

func NewRouter(app fiber.Router, v token.Verifier, h *Registry) *Router {
	return &Router{app: app, tokenVerifier: v, handlers: h}
}

func (r *Router) RegisterRoutes() {
	g := r.app.Group("/vault/analysis")
	g.Get("/i18n/errors/:lang", r.handlers.I18n.GetErrorTranslations)
	protected := g.Group("", middleware.TokenAuth(r.tokenVerifier))
	protected.Post("/tls", r.handlers.Analysis.TLS)
}
