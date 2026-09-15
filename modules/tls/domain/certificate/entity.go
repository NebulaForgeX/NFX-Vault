package certificate

import (
	"encoding/json"
	"time"
)

type Certificate struct{ state State }

type State struct {
	ID               string
	AccountID        *string
	ProfileID        *string
	Domain           string
	FolderName       *string
	Status           string
	Email            *string
	CertPEM          *string
	KeyPEM           *string
	SANs             json.RawMessage
	Issuer           *string
	NotBefore        *time.Time
	NotAfter         *time.Time
	IsValid          *bool
	DaysRemaining    *int
	SANsChanged      bool
	LastErrorMessage *string
	LastErrorTime    *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func NewFromState(st State) *Certificate { return &Certificate{state: st} }
func (c *Certificate) State() State      { return c.state }
func (c *Certificate) Load(st State)     { c.state = st }
