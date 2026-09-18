package credential

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

func (c *Credential) ApplySecret(apiUser, userName, apiKey, clientIP string, sandbox bool) error {
	apiUser = strings.TrimSpace(apiUser)
	userName = strings.TrimSpace(userName)
	apiKey = strings.TrimSpace(apiKey)
	clientIP = strings.TrimSpace(clientIP)
	if userName == "" {
		userName = apiUser
	}
	if apiUser == "" {
		return ErrAPIUserRequired
	}
	if clientIP == "" {
		return ErrClientIPRequired
	}
	if err := validateIPv4(clientIP); err != nil {
		return err
	}
	c.state.APIUser = apiUser
	c.state.UserName = userName
	c.state.ClientIP = clientIP
	c.state.Sandbox = sandbox
	if apiKey != "" {
		c.state.APIKey = apiKey
	}
	if c.state.APIKey == "" {
		return ErrAPIKeyRequired
	}
	c.state.UpdatedAt = time.Now().UTC()
	return nil
}

func (c *Credential) BindProfile(profileID *uuid.UUID) {
	c.state.ProfileID = profileID
	c.state.UpdatedAt = time.Now().UTC()
}

func (c *Credential) MarkVerified(at time.Time) {
	c.state.LastVerifiedAt = &at
	c.state.LastErrorMessage = nil
	c.state.UpdatedAt = at
}

func (c *Credential) RecordError(message string) {
	msg := strings.TrimSpace(message)
	c.state.LastErrorMessage = &msg
	c.state.UpdatedAt = time.Now().UTC()
}
