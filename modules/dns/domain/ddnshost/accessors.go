package ddnshost

import (
	"time"

	"github.com/google/uuid"
)

func (h *Host) ID() uuid.UUID             { return h.state.ID }
func (h *Host) AccountID() uuid.UUID      { return h.state.AccountID }
func (h *Host) ProfileID() *uuid.UUID     { return h.state.ProfileID }
func (h *Host) CredentialID() *uuid.UUID  { return h.state.CredentialID }
func (h *Host) Domain() string            { return h.state.Domain }
func (h *Host) HostName() string          { return h.state.Host }
func (h *Host) DDNSPassword() string      { return h.state.DDNSPassword }
func (h *Host) LastIPv4() *string         { return h.state.LastIPv4 }
func (h *Host) LastSyncedAt() *time.Time  { return h.state.LastSyncedAt }
func (h *Host) LastErrorMessage() *string { return h.state.LastErrorMessage }
func (h *Host) CreatedAt() time.Time      { return h.state.CreatedAt }
func (h *Host) UpdatedAt() time.Time      { return h.state.UpdatedAt }
func (h *Host) State() HostState          { return h.state }
func (h *Host) HasDDNSPassword() bool     { return h.state.DDNSPassword != "" }
