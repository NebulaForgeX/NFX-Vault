package handler

import (
	authconn "nfxvault/connections/auth"
	commonErr "nfxvault/errors/src/common"
	sysErr "nfxvault/errors/src/sys"
	"nfxvault/pkgs/errx"
	"nfxvault/pkgs/fiberx"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type accountContext struct {
	AccountID uuid.UUID
	ProfileID uuid.UUID
}

func accountProfile(c fiber.Ctx, identity *authconn.Client) (accountContext, *errx.Error) {
	aid, ok := fiberx.AccountIDFromContext(c.Context())
	if !ok {
		return accountContext{}, sysErr.ErrInvalidToken
	}
	pid, ok := fiberx.ProfileIDFromContext(c.Context())
	if !ok {
		return accountContext{}, sysErr.ErrInvalidToken
	}
	scope, _ := fiberx.ProfileScopeFromContext(c.Context())
	if identity != nil {
		allowed, err := identity.Account.EnsureOwnedProfile(c.Context(), aid, pid, scope)
		if err != nil {
			return accountContext{}, commonErr.ErrIdentityUnavailable
		}
		if !allowed {
			return accountContext{}, commonErr.ErrProfileNotOwned
		}
	}
	return accountContext{AccountID: aid, ProfileID: pid}, nil
}
