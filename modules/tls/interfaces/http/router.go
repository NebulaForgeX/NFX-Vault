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
	r.app.Get("/.well-known/acme-challenge/:token", r.handlers.App.ACMEChallenge)
	g := r.app.Group("/vault/tls")
	g.Get("/i18n/errors/:lang", r.handlers.I18n.GetErrorTranslations)
	protected := g.Group("", middleware.TokenAuth(r.tokenVerifier))
	protected.Get("/check", r.handlers.App.List)
	protected.Get("/detail-by-id/:certificateId", r.handlers.App.Detail)
	protected.Post("/apply", r.handlers.App.Apply)
	protected.Post("/reapply", r.handlers.App.Reapply)
	protected.Post("/create", r.handlers.App.Create)
	protected.Put("/update/manual-add", r.handlers.App.UpdateManual)
	protected.Delete("/delete", r.handlers.App.Delete)
	protected.Post("/search", r.handlers.App.Search)
	protected.Post("/parse-preview", r.handlers.App.ParsePreview)
	protected.Post("/invalidate-cache", r.handlers.App.InvalidateCache)
}
