package dns

import "nfxvault/pkgs/errx"

const (
	CodeNamecheapCredentialRequired = "NAMECHEAP_CREDENTIAL_REQUIRED"
	CodeNamecheapCredentialNotFound = "NAMECHEAP_CREDENTIAL_NOT_FOUND"
	CodeInvalidNamecheapCredential  = "INVALID_NAMECHEAP_CREDENTIAL"
	CodeInvalidIPv4                 = "INVALID_IPV4"
	CodeInvalidDomain               = "INVALID_DOMAIN"
	CodeInvalidDdnsHost             = "INVALID_DDNS_HOST"
	CodeDdnsHostNotFound            = "DDNS_HOST_NOT_FOUND"
	CodeInvalidARecordItems         = "INVALID_A_RECORD_ITEMS"
	CodeARecordUpdateFailed         = "A_RECORD_UPDATE_FAILED"
	CodeOutboundIPFailed            = "OUTBOUND_IP_FAILED"
)

var (
	ErrNamecheapCredentialRequired = errx.FailedPrecond(CodeNamecheapCredentialRequired, "save Namecheap API credentials first")
	ErrNamecheapCredentialNotFound = errx.NotFound(CodeNamecheapCredentialNotFound, "namecheap credential not found")
	ErrInvalidNamecheapCredential  = errx.InvalidArg(CodeInvalidNamecheapCredential, "api_user and client_ip are required")
	ErrInvalidIPv4                 = errx.InvalidArg(CodeInvalidIPv4, "ip must be a valid IPv4 address")
	ErrInvalidDomain               = errx.InvalidArg(CodeInvalidDomain, "domain is required")
	ErrInvalidDdnsHost             = errx.InvalidArg(CodeInvalidDdnsHost, "ddns password or domain is required")
	ErrDdnsHostNotFound            = errx.NotFound(CodeDdnsHostNotFound, "ddns host not found")
	ErrInvalidARecordItems         = errx.InvalidArg(CodeInvalidARecordItems, "items is required")
	ErrARecordUpdateFailed         = errx.Internal(CodeARecordUpdateFailed, "failed to update A record")
	ErrOutboundIPFailed            = errx.Internal(CodeOutboundIPFailed, "failed to detect outbound IPv4")
)

/*
!NAMECHEAP_CREDENTIAL_REQUIRED
*en<save Namecheap API credentials first>
*zh<请先保存 Namecheap API 凭证>
*fr<enregistrez d'abord les identifiants API Namecheap>

!NAMECHEAP_CREDENTIAL_NOT_FOUND
*en<namecheap credential not found>
*zh<找不到 Namecheap 凭证>
*fr<identifiant Namecheap introuvable>

!INVALID_NAMECHEAP_CREDENTIAL
*en<api_user and client_ip are required>
*zh<需要填写 api_user 与 client_ip>
*fr<api_user et client_ip sont requis>

!INVALID_IPV4
*en<ip must be a valid IPv4 address>
*zh<必须是有效的 IPv4 地址>
*fr<l'adresse IPv4 est invalide>

!INVALID_DOMAIN
*en<domain is required>
*zh<域名不能为空>
*fr<le domaine est requis>

!INVALID_DDNS_HOST
*en<ddns password or domain is required>
*zh<需要填写 DDNS 密码或域名>
*fr<le mot de passe DDNS ou le domaine est requis>

!DDNS_HOST_NOT_FOUND
*en<ddns host not found>
*zh<找不到该 DDNS host>
*fr<hôte DDNS introuvable>

!INVALID_A_RECORD_ITEMS
*en<items is required>
*zh<需要提供要更新的记录>
*fr<la liste des enregistrements est requise>

!A_RECORD_UPDATE_FAILED
*en<failed to update A record>
*zh<A 记录更新失败>
*fr<échec de la mise à jour de l'enregistrement A>

!OUTBOUND_IP_FAILED
*en<failed to detect outbound IPv4>
*zh<无法检测出口 IPv4>
*fr<échec de la détection de l'IPv4 sortant>
*/
