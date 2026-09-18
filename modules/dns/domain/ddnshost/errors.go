package ddnshost

import "errors"

var (
	ErrHostNotFound      = errors.New("ddns host not found")
	ErrDomainRequired    = errors.New("domain is required")
	ErrInvalidDomain     = errors.New("invalid domain")
	ErrPasswordRequired  = errors.New("ddns_password is required")
	ErrAccountIDRequired = errors.New("account_id is required")
	ErrHostNotOwned      = errors.New("ddns host does not belong to account")
)
