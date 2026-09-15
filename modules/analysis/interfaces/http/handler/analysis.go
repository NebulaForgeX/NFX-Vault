package handler

import (
	analysisapp "nfxvault/modules/analysis/application/analysis"
	"nfxvault/pkgs/fiberx"
	"nfxvault/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type AnalysisHandler struct{ svc *analysisapp.Service }

func NewAnalysisHandler(svc *analysisapp.Service) *AnalysisHandler { return &AnalysisHandler{svc: svc} }

func (h *AnalysisHandler) TLS(c fiber.Ctx) error {
	var req struct {
		Certificate string `json:"certificate"`
		PrivateKey  string `json:"private_key"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: h.svc.AnalyzeTLS(req.Certificate, req.PrivateKey)})
}
