package handler

import (
	"os"

	authconn "nfxvault/connections/auth"
	commonErr "nfxvault/errors/src/common"
	fileErr "nfxvault/errors/src/file"
	sysErr "nfxvault/errors/src/sys"
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

func (h *FileHandler) accountID(c fiber.Ctx) (string, *errx.Error) {
	aid, ok := fiberx.AccountIDFromContext(c.Context())
	if !ok {
		return "", sysErr.ErrInvalidToken
	}
	pid, ok := fiberx.ProfileIDFromContext(c.Context())
	if !ok {
		return "", sysErr.ErrInvalidToken
	}
	scope, _ := fiberx.ProfileScopeFromContext(c.Context())
	if h.identity != nil {
		allowed, err := h.identity.Account.EnsureOwnedProfile(c.Context(), aid, pid, scope)
		if err != nil {
			return "", commonErr.ErrIdentityUnavailable
		}
		if !allowed {
			return "", commonErr.ErrProfileNotOwned
		}
	}
	return aid.String(), nil
}

func (h *FileHandler) List(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.List(c.Context(), aid, c.Query("path"))})
}

func (h *FileHandler) Content(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Content(c.Context(), aid, c.Query("path"))})
}

func (h *FileHandler) Download(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	b, name, mt, err := h.svc.Download(c.Context(), aid, c.Query("path"))
	if err != nil {
		if os.IsPermission(err) {
			return fiberx.ErrorFromErrx(c, fileErr.ErrInvalidPath)
		}
		return fiberx.ErrorFromErrx(c, fileErr.ErrFileNotFound)
	}
	c.Set("Content-Type", mt)
	c.Set("Content-Disposition", `attachment; filename="`+name+`"`)
	return c.Send(b)
}

func (h *FileHandler) Export(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.ExportAll(c.Context(), aid)})
}

func (h *FileHandler) ExportSingle(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		CertificateID string `json:"certificate_id"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.ExportSingle(c.Context(), aid, req.CertificateID)})
}

func (h *FileHandler) Delete(c fiber.Ctx) error {
	aid, ferr := h.accountID(c)
	if ferr != nil {
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
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Delete(c.Context(), aid, req.Store, req.Path, req.ItemType)})
}
