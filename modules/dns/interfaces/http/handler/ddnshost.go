package handler

import (
	authconn "nfxvault/connections/auth"
	ddnsapp "nfxvault/modules/dns/application/ddnshost"
	ddnsCommands "nfxvault/modules/dns/application/ddnshost/commands"
	"nfxvault/modules/dns/interfaces/http/dto/reqdto"
	"nfxvault/modules/dns/interfaces/http/dto/respdto"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type DdnsHostHandler struct {
	appSvc   *ddnsapp.Service
	identity *authconn.Client
}

func NewDdnsHostHandler(appSvc *ddnsapp.Service, identity *authconn.Client) *DdnsHostHandler {
	return &DdnsHostHandler{appSvc: appSvc, identity: identity}
}

func (h *DdnsHostHandler) List(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	items, err := h.appSvc.ListHosts(c.Context(), ddnsCommands.ListHostsCmd{AccountID: ac.AccountID, Domain: c.Query("domain")})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DdnsHostListDTO{Items: respdto.DdnsHostListToDTO(items)}})
}

func (h *DdnsHostHandler) Upsert(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req reqdto.DdnsHostUpsertRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	row, err := h.appSvc.UpsertHost(c.Context(), req.ToUpsertCmd(ac.AccountID, ac.ProfileID))
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DdnsHostROToDTO(row)})
}

func (h *DdnsHostHandler) Delete(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req reqdto.DdnsHostDeleteRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	out, err := h.appSvc.DeleteHost(c.Context(), ddnsCommands.DeleteHostCmd{AccountID: ac.AccountID, ID: req.ID})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DdnsHostCommandROToDTO(out)})
}
