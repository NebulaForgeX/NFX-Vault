package commands

import "github.com/google/uuid"

type ListDomainsCmd struct {
	AccountID uuid.UUID
}

type GetHostsCmd struct {
	AccountID uuid.UUID
	Domain    string
}

type ARecordItemCmd struct {
	Domain string
	Host   string
}

type UpdateARecordsCmd struct {
	AccountID uuid.UUID
	IP        string
	Items     []ARecordItemCmd
}
