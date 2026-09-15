package handler

import (
	"os"
	"path/filepath"
	"strconv"

	tlsapp "nfxvault/modules/tls/application/tls"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type TLSHandler struct{ svc *tlsapp.Service }

func NewTLSHandler(svc *tlsapp.Service) *TLSHandler { return &TLSHandler{svc: svc} }

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
	var req struct {
		Domain, Email, FolderName, Webroot string
		SANs                               []string `json:"sans"`
		ForceRenewal                       bool     `json:"force_renewal"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.Apply(c.Context(), req.Domain, req.Email, req.SANs, req.FolderName, req.ForceRenewal)})
}

func (h *TLSHandler) Reapply(c fiber.Ctx) error {
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
	var req struct {
		Domain, Certificate, PrivateKey, FolderName, Email, Issuer string
		SANs                                                       []string `json:"sans"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.CreateManual(c.Context(), req.Domain, req.Certificate, req.PrivateKey, req.SANs, req.FolderName, req.Email, req.Issuer)})
}

func (h *TLSHandler) UpdateManual(c fiber.Ctx) error {
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
