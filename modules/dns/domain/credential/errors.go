package credential

import "errors"

var (
	ErrCredentialNotFound = errors.New("credential not found")
	ErrAPIUserRequired    = errors.New("api_user is required")
	ErrAPIKeyRequired     = errors.New("api_key is required")
	ErrClientIPRequired   = errors.New("client_ip is required")
	ErrInvalidClientIP    = errors.New("client_ip must be a valid IPv4 address")
	ErrAccountIDRequired  = errors.New("account_id is required")
)
