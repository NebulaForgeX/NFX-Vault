package common

import "nfxvault/pkgs/errx"

const (
	CodeIdentityUnavailable = "IDENTITY_UNAVAILABLE"
	CodeProfileNotOwned     = "PROFILE_NOT_OWNED"
)

var (
	ErrIdentityUnavailable = errx.Unauthorized(CodeIdentityUnavailable, "identity lookup failed")
	ErrProfileNotOwned     = errx.Unauthorized(CodeProfileNotOwned, "profile does not belong to account")
)

/*
!IDENTITY_UNAVAILABLE
*en<identity lookup failed>
*zh<身份服务不可用>
*fr<échec de la vérification d'identité>

!PROFILE_NOT_OWNED
*en<profile does not belong to account>
*zh<该资料不属于当前账号>
*fr<le profil n'appartient pas au compte>
*/
