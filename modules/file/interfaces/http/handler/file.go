package handler

import (
	authconn "nfxvault/connections/auth"
	fileapp "nfxvault/modules/file/application/file"
	"nfxvault/pkgs/errx"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type FileHandler struct {
	svc      *fileapp.Service
	identity *authconn.Client
}

func NewFileHandler(svc *fileapp.Service, identity *authconn.Client) *FileHandler {
	return &FileHandler{svc: svc, identity: identity}
}

func (h *FileHandler) accountProfile(c fiber.Ctx) *errx.Error {
	aid, ok := fiberx.AccountIDFromContext(c.Context())
	if !ok {
		return errx.Unauthorized("INVALID_TOKEN", "missing account")
	}
	pid, ok := fiberx.ProfileIDFromContext(c.Context())
	if !ok {
		return errx.Unauthorized("INVALID_TOKEN", "missing profile")
	}
	scope, _ := fiberx.ProfileScopeFromContext(c.Context())
	if h.identity != nil {
		allowed, err := h.identity.Account.EnsureOwnedProfile(c.Context(), aid, pid, scope)
		if err != nil {
			return errx.Unauthorized("IDENTITY_UNAVAILABLE", "identity lookup failed").WithCause(err)
		}
		if !allowed {
			return errx.Unauthorized("PROFILE_NOT_OWNED", "profile does not belong to account")
		}
	}
	return nil
}

func (h *FileHandler) List(c fiber.Ctx) error {
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.List(c.Query("path"))})
}

func (h *FileHandler) Content(c fiber.Ctx) error {
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Content(c.Query("path"))})
}

func (h *FileHandler) Download(c fiber.Ctx) error {
	b, name, mt, err := h.svc.Download(c.Query("path"))
	if err != nil {
		return c.Status(404).JSON(map[string]any{"success": false, "message": err.Error()})
	}
	c.Set("Content-Type", mt)
	c.Set("Content-Disposition", `attachment; filename="`+name+`"`)
	return c.Send(b)
}

func (h *FileHandler) Export(c fiber.Ctx) error {
	if ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.ExportAll(c.Context())})
}

func (h *FileHandler) ExportSingle(c fiber.Ctx) error {
	if ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		CertificateID string `json:"certificate_id"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.ExportSingle(c.Context(), req.CertificateID)})
}

func (h *FileHandler) Delete(c fiber.Ctx) error {
	if ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		Store    string `json:"store"`
		Path     string `json:"path"`
		ItemType string `json:"item_type"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Delete(c.Context(), req.Store, req.Path, req.ItemType)})
}
