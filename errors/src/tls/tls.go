package tls

import "nfxvault/pkgs/errx"

const (
	CodeCertificateNotFound = "CERTIFICATE_NOT_FOUND"
)

var (
	ErrCertificateNotFound = errx.NotFound(CodeCertificateNotFound, "certificate not found")
)

/*
!CERTIFICATE_NOT_FOUND
*en<certificate not found>
*zh<证书不存在>
*fr<certificat introuvable>
*/
