package ddnshost

import "github.com/google/uuid"

func (h *Host) Validate() error {
	if h.AccountID() == uuid.Nil {
		return ErrAccountIDRequired
	}
	if h.Domain() == "" {
		return ErrDomainRequired
	}
	if h.DDNSPassword() == "" {
		return ErrPasswordRequired
	}
	return nil
}

func validateNewHostParams(p NewHostParams) error {
	if p.AccountID == uuid.Nil {
		return ErrAccountIDRequired
	}
	if p.Domain == "" {
		return ErrDomainRequired
	}
	if p.DDNSPassword == "" {
		return ErrPasswordRequired
	}
	return nil
}
