package handler

import (
	authconn "nfxvault/connections/auth"
	credapp "nfxvault/modules/dns/application/credential"
	credCommands "nfxvault/modules/dns/application/credential/commands"
	"nfxvault/modules/dns/interfaces/http/dto/reqdto"
	"nfxvault/modules/dns/interfaces/http/dto/respdto"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type CredentialHandler struct {
	appSvc   *credapp.Service
	identity *authconn.Client
}

func NewCredentialHandler(appSvc *credapp.Service, identity *authconn.Client) *CredentialHandler {
	return &CredentialHandler{appSvc: appSvc, identity: identity}
}

func (h *CredentialHandler) GetByAccount(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	row, err := h.appSvc.GetCredential(c.Context(), ac.AccountID)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CredentialROToDTO(row)})
}

func (h *CredentialHandler) Upsert(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req reqdto.CredentialUpsertRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	row, err := h.appSvc.UpsertCredential(c.Context(), req.ToUpsertCmd(ac.AccountID, ac.ProfileID))
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CredentialROToDTO(row)})
}

func (h *CredentialHandler) Delete(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	out, err := h.appSvc.DeleteCredential(c.Context(), credCommands.DeleteCredentialCmd{AccountID: ac.AccountID})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandROToDTO(out)})
}

func (h *CredentialHandler) Verify(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	out, err := h.appSvc.VerifyCredential(c.Context(), credCommands.VerifyCredentialCmd{AccountID: ac.AccountID})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandROToDTO(out)})
}
