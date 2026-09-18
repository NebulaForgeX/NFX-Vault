package credential

import (
	"time"

	"github.com/google/uuid"
)

func (c *Credential) ID() uuid.UUID              { return c.state.ID }
func (c *Credential) AccountID() uuid.UUID       { return c.state.AccountID }
func (c *Credential) ProfileID() *uuid.UUID      { return c.state.ProfileID }
func (c *Credential) APIUser() string            { return c.state.APIUser }
func (c *Credential) UserName() string           { return c.state.UserName }
func (c *Credential) APIKey() string             { return c.state.APIKey }
func (c *Credential) ClientIP() string           { return c.state.ClientIP }
func (c *Credential) Sandbox() bool              { return c.state.Sandbox }
func (c *Credential) LastVerifiedAt() *time.Time { return c.state.LastVerifiedAt }
func (c *Credential) LastErrorMessage() *string  { return c.state.LastErrorMessage }
func (c *Credential) CreatedAt() time.Time       { return c.state.CreatedAt }
func (c *Credential) UpdatedAt() time.Time       { return c.state.UpdatedAt }
func (c *Credential) State() CredentialState     { return c.state }
func (c *Credential) HasAPIKey() bool            { return c.state.APIKey != "" }
