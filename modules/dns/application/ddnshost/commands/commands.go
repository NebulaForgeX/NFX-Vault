package commands

import "github.com/google/uuid"

type UpsertHostCmd struct {
	AccountID    uuid.UUID
	ProfileID    uuid.UUID
	Domain       string
	Host         string
	DDNSPassword string
}

type DeleteHostCmd struct {
	AccountID uuid.UUID
	ID        uuid.UUID
}

type ListHostsCmd struct {
	AccountID uuid.UUID
	Domain    string
}
