package handler

import (
	authconn "nfxvault/connections/auth"
	dnsapp "nfxvault/modules/dns/application/dns"
	dnsCommands "nfxvault/modules/dns/application/dns/commands"
	"nfxvault/modules/dns/interfaces/http/dto/reqdto"
	"nfxvault/modules/dns/interfaces/http/dto/respdto"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type DNSHandler struct {
	appSvc   *dnsapp.Service
	identity *authconn.Client
}

func NewDNSHandler(appSvc *dnsapp.Service, identity *authconn.Client) *DNSHandler {
	return &DNSHandler{appSvc: appSvc, identity: identity}
}

func (h *DNSHandler) ListDomains(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	items, err := h.appSvc.ListDomains(c.Context(), dnsCommands.ListDomainsCmd{AccountID: ac.AccountID})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DomainsROToDTO(items)})
}

func (h *DNSHandler) GetHosts(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	row, err := h.appSvc.GetHosts(c.Context(), dnsCommands.GetHostsCmd{AccountID: ac.AccountID, Domain: c.Query("domain")})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.HostsROToDTO(row)})
}

func (h *DNSHandler) UpdateARecords(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req reqdto.ARecordsUpdateRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	out, err := h.appSvc.UpdateARecords(c.Context(), req.ToUpdateCmd(ac.AccountID))
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.UpdateARecordsROToDTO(out)})
}

func (h *DNSHandler) OutboundIP(c fiber.Ctx) error {
	if _, ferr := accountProfile(c, h.identity); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	out, err := h.appSvc.OutboundIPv4(c.Context())
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.OutboundIPROToDTO(out)})
}
