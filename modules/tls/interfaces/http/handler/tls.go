package handler

import (
	"os"
	"path/filepath"
	"strconv"

	authconn "nfxvault/connections/auth"
	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/pkgs/errx"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type TLSHandler struct {
	svc      *tlsapp.Service
	identity *authconn.Client
}

func NewTLSHandler(svc *tlsapp.Service, identity *authconn.Client) *TLSHandler {
	return &TLSHandler{svc: svc, identity: identity}
}

func (h *TLSHandler) accountProfile(c fiber.Ctx) (accountID, profileID string, ferr *errx.Error) {
	aid, ok := fiberx.AccountIDFromContext(c.Context())
	if !ok {
		return "", "", errx.Unauthorized("INVALID_TOKEN", "missing account")
	}
	pid, ok := fiberx.ProfileIDFromContext(c.Context())
	if !ok {
		return "", "", errx.Unauthorized("INVALID_TOKEN", "missing profile")
	}
	scope, _ := fiberx.ProfileScopeFromContext(c.Context())
	if h.identity != nil {
		allowed, err := h.identity.Account.EnsureOwnedProfile(c.Context(), aid, pid, scope)
		if err != nil {
			return "", "", errx.Unauthorized("IDENTITY_UNAVAILABLE", "identity lookup failed").WithCause(err)
		}
		if !allowed {
			return "", "", errx.Unauthorized("PROFILE_NOT_OWNED", "profile does not belong to account")
		}
	}
	return aid.String(), pid.String(), nil
}

func (h *TLSHandler) List(c fiber.Ctx) error {
	offset, _ := strconv.Atoi(c.Query("offset"))
	limit, _ := strconv.Atoi(c.Query("limit"))
	out, err := h.svc.List(c.Context(), offset, limit)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: out})
}

func (h *TLSHandler) Detail(c fiber.Ctx) error {
	row, err := h.svc.Detail(c.Context(), c.Params("certificateId"))
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: row})
}

func (h *TLSHandler) Apply(c fiber.Ctx) error {
	aid, pid, ferr := h.accountProfile(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		Domain, Email, FolderName, Webroot string
		SANs                               []string `json:"sans"`
		ForceRenewal                       bool     `json:"force_renewal"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Apply(c.Context(), aid, pid, req.Domain, req.Email, req.SANs, req.FolderName, req.ForceRenewal)})
}

func (h *TLSHandler) Reapply(c fiber.Ctx) error {
	if _, _, ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		CertificateID string `json:"certificate_id"`
		ForceRenewal  bool   `json:"force_renewal"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Reapply(c.Context(), req.CertificateID, req.ForceRenewal)})
}

func (h *TLSHandler) Create(c fiber.Ctx) error {
	aid, pid, ferr := h.accountProfile(c)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		Domain, Certificate, PrivateKey, FolderName, Email, Issuer string
		SANs                                                       []string `json:"sans"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.CreateManual(c.Context(), aid, pid, req.Domain, req.Certificate, req.PrivateKey, req.SANs, req.FolderName, req.Email, req.Issuer)})
}

func (h *TLSHandler) UpdateManual(c fiber.Ctx) error {
	if _, _, ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		CertificateID string   `json:"certificate_id"`
		SANs          []string `json:"sans"`
		FolderName    *string  `json:"folder_name"`
		Email         *string  `json:"email"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.UpdateManual(c.Context(), req.CertificateID, req.SANs, req.FolderName, req.Email)})
}

func (h *TLSHandler) Delete(c fiber.Ctx) error {
	if _, _, ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req struct {
		CertificateID string `json:"certificate_id"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Delete(c.Context(), req.CertificateID)})
}

func (h *TLSHandler) Search(c fiber.Ctx) error {
	var req struct {
		Keyword string `json:"keyword"`
		Offset  int    `json:"offset"`
		Limit   int    `json:"limit"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	out, err := h.svc.Search(c.Context(), req.Keyword, req.Offset, req.Limit)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: out})
}

func (h *TLSHandler) ParsePreview(c fiber.Ctx) error {
	var req struct {
		Certificate string `json:"certificate"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.ParsePreview(req.Certificate)})
}

func (h *TLSHandler) InvalidateCache(c fiber.Ctx) error {
	if _, _, ferr := h.accountProfile(c); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.InvalidateCache(c.Context())})
}

func (h *TLSHandler) ACMEChallenge(c fiber.Ctx) error {
	token := c.Params("token")
	dir := h.svc.ACMEChallengeDir()
	p := filepath.Join(dir, ".well-known", "acme-challenge", filepath.Base(token))
	b, err := os.ReadFile(p)
	if err != nil {
		return c.Status(404).SendString("Challenge token not found")
	}
	c.Set("Content-Type", "text/plain")
	return c.Send(b)
}
