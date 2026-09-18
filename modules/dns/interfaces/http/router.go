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
	g := r.app.Group("/vault/dns")
	g.Get("/i18n/errors/:lang", r.handlers.I18n.GetErrorTranslations)
	protected := g.Group("", middleware.TokenAuth(r.tokenVerifier))
	protected.Get("/credential", r.handlers.Credential.GetByAccount)
	protected.Put("/credential", r.handlers.Credential.Upsert)
	protected.Delete("/credential", r.handlers.Credential.Delete)
	protected.Post("/credential/verify", r.handlers.Credential.Verify)
	protected.Get("/domains", r.handlers.DNS.ListDomains)
	protected.Get("/hosts", r.handlers.DNS.GetHosts)
	protected.Get("/ddns-hosts", r.handlers.DdnsHost.List)
	protected.Put("/ddns-hosts", r.handlers.DdnsHost.Upsert)
	protected.Delete("/ddns-hosts", r.handlers.DdnsHost.Delete)
	protected.Put("/a-records", r.handlers.DNS.UpdateARecords)
	protected.Get("/outbound-ip", r.handlers.DNS.OutboundIP)
}
