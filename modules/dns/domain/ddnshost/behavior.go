package ddnshost

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

func (h *Host) ApplyPassword(password string) error {
	password = strings.TrimSpace(password)
	if password != "" {
		h.state.DDNSPassword = password
	}
	if h.state.DDNSPassword == "" {
		return ErrPasswordRequired
	}
	h.state.UpdatedAt = time.Now().UTC()
	return nil
}

func (h *Host) BindProfile(profileID *uuid.UUID) {
	h.state.ProfileID = profileID
	h.state.UpdatedAt = time.Now().UTC()
}

func (h *Host) BindCredential(credentialID *uuid.UUID) {
	h.state.CredentialID = credentialID
	h.state.UpdatedAt = time.Now().UTC()
}

func (h *Host) MarkSynced(ipv4 string, at time.Time) {
	ip := strings.TrimSpace(ipv4)
	h.state.LastIPv4 = &ip
	h.state.LastSyncedAt = &at
	h.state.LastErrorMessage = nil
	h.state.UpdatedAt = at
}

func (h *Host) RecordError(message string) {
	msg := strings.TrimSpace(message)
	h.state.LastErrorMessage = &msg
	h.state.UpdatedAt = time.Now().UTC()
}
